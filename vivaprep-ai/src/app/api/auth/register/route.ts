import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import {
  sanitizeInput,
  sanitizeEmail,
  validatePassword,
  logSecurityEvent,
  safeError,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = rateLimit(`auth:${ip}`, AUTH_RATE_LIMIT);
    if (!rl.allowed) {
      logSecurityEvent({
        type: "rate_limit",
        ip,
        details: "Register rate limit hit",
        timestamp: new Date(),
      });
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${rl.resetInSeconds}s` },
        { status: 429 }
      );
    }

    const body = await req.json();

    // ── Input validation & sanitization ───────────────────────────────────
    const rawName = typeof body.name === "string" ? body.name : "";
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const rawPassword = typeof body.password === "string" ? body.password : "";

    const name = sanitizeInput(rawName);
    const email = sanitizeEmail(rawEmail);

    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // ── Password strength check ───────────────────────────────────────────
    const passwordCheck = validatePassword(rawPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors[0] },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", safeError(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
