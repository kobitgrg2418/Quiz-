import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, password: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in VerificationToken table
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email.toLowerCase().trim(),
          token: "password-reset",
        },
      },
      update: {
        token,
        expires,
      },
      create: {
        identifier: email.toLowerCase().trim(),
        token,
        expires,
      },
    });

    // In production, send an email with the reset link:
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${email}`;
    // await sendEmail({ to: email, subject: "Reset your password", html: ... });

    console.log(
      `[DEV] Password reset token for ${email}: ${token}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
