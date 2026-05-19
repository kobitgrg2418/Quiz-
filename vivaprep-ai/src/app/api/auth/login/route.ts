import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import { rateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import {
  sanitizeEmail,
  checkAccountLockout,
  recordFailedAttempt,
  resetFailedAttempts,
  logSecurityEvent,
  safeError,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // ── Rate limit by IP ──────────────────────────────────────────────────
    const rl = rateLimit(`auth:${ip}`, AUTH_RATE_LIMIT);
    if (!rl.allowed) {
      logSecurityEvent({
        type: "rate_limit",
        ip,
        details: `Login rate limit hit`,
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: `Too many login attempts. Try again in ${rl.resetInSeconds}s` },
        { status: 429 }
      );
    }

    // ── Input validation ──────────────────────────────────────────────────
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    const email = sanitizeEmail(rawEmail);
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing or invalid email/password" },
        { status: 400 }
      );
    }

    // ── Account lockout check ─────────────────────────────────────────────
    const lockoutKey = `login:${email}`;
    const lockout = checkAccountLockout(lockoutKey);
    if (lockout.locked) {
      logSecurityEvent({
        type: "account_lockout",
        ip,
        details: `Locked account login attempt for ${email}`,
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${Math.ceil(lockout.remainingSeconds / 60)} minutes` },
        { status: 423 }
      );
    }

    // ── Credential verification ───────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      recordFailedAttempt(lockoutKey, ip);
      logSecurityEvent({
        type: "auth_failure",
        ip,
        details: `Failed login — unknown email: ${email}`,
        timestamp: new Date(),
      });
      // Consistent response to prevent user enumeration
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      recordFailedAttempt(lockoutKey, ip);
      logSecurityEvent({
        type: "auth_failure",
        ip,
        userId: user.id,
        details: `Failed login — wrong password for ${email}`,
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ── Success: reset lockout & issue token ──────────────────────────────
    resetFailedAttempts(lockoutKey);

    const isSecure = process.env.NODE_ENV === "production";
    const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";

    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        sub: user.id,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      salt: cookieName,
    });

    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", safeError(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
