import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const set = await prisma.flashcardSet.findUnique({
      where: { id },
      include: {
        flashcards: { orderBy: { order: "asc" } },
        document: { select: { title: true } },
      },
    });

    if (!set || set.userId !== session.user.id) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 });
    }

    return NextResponse.json(set);
  } catch (error) {
    console.error("Flashcard set fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch flashcard set" }, { status: 500 });
  }
}

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

    const set = await prisma.flashcardSet.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!set || set.userId !== session.user.id) {
      return NextResponse.json({ error: "Flashcard set not found" }, { status: 404 });
    }

    await prisma.flashcardSet.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Flashcard set delete error:", error);
    return NextResponse.json({ error: "Failed to delete flashcard set" }, { status: 500 });
  }
}
