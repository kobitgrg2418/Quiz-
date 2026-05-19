import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const note = await prisma.note.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Note delete error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
