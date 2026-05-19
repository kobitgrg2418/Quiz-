import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/profile/photo — upload profile photo
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPG, PNG, WebP, or GIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 5MB" },
      { status: 400 }
    );
  }

  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Delete old avatar if it's a local file
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (currentUser?.image?.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), "public", currentUser.image);
      await unlink(oldPath).catch(() => {});
    }

    // Save new file
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/avatars/${filename}`;

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: { id: true, image: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/photo — remove profile photo
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  // Delete local file if exists
  if (user?.image?.startsWith("/uploads/avatars/")) {
    const filepath = path.join(process.cwd(), "public", user.image);
    await unlink(filepath).catch(() => {});
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  return NextResponse.json({ success: true });
}
