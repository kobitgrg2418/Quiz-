import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  sanitizeInput,
  sanitizeEmail,
  validatePassword,
  safeError,
} from "@/lib/security";

// GET /api/profile — fetch current user profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      preferences: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT /api/profile — update name, email, or password
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { currentPassword, preferences } = body;

  const updateData: Record<string, unknown> = {};

  // Update preferences if provided (sanitize JSON)
  if (preferences !== undefined) {
    if (typeof preferences !== "object" || Array.isArray(preferences)) {
      return NextResponse.json(
        { error: "Preferences must be a JSON object" },
        { status: 400 }
      );
    }
    updateData.preferences = preferences;
  }

  if (body.name !== undefined) {
    const name = sanitizeInput(String(body.name));
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }
    updateData.name = name;
  }

  if (body.email !== undefined) {
    const email = sanitizeEmail(String(body.email));
    if (!email) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    updateData.email = email;
  }

  // Password change
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 403 }
      );
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors[0] },
        { status: 400 }
      );
    }

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updatedUser);
}

// DELETE /api/profile — delete account
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete all related data then the user
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { userId: session.user.id } }),
    prisma.studySession.deleteMany({ where: { userId: session.user.id } }),
    prisma.quizAttempt.deleteMany({ where: { userId: session.user.id } }),
    prisma.flashcardSet.deleteMany({ where: { userId: session.user.id } }),
    prisma.note.deleteMany({ where: { userId: session.user.id } }),
    prisma.document.deleteMany({ where: { userId: session.user.id } }),
    prisma.account.deleteMany({ where: { userId: session.user.id } }),
    prisma.session.deleteMany({ where: { userId: session.user.id } }),
    prisma.user.delete({ where: { id: session.user.id } }),
  ]);

  return NextResponse.json({ success: true });
}
