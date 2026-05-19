import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFlashcards } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sets = await prisma.flashcardSet.findMany({
      where: { userId: session.user.id },
      include: {
        document: { select: { title: true } },
        flashcards: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sets);
  } catch (error) {
    console.error("Flashcard list error:", error);
    return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, count = 15 } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.status !== "READY") {
      return NextResponse.json({ error: "Document not found or not ready" }, { status: 404 });
    }

    const content = await getDocumentContext(documentId);
    const generated = await generateFlashcards(content, count);

    const flashcardSet = await prisma.flashcardSet.create({
      data: {
        title: generated.title,
        documentId,
        userId: session.user.id,
        flashcards: {
          create: generated.flashcards.map((f, i) => ({
            front: f.front,
            back: f.back,
            example: f.example || null,
            note: f.note || null,
            order: i,
          })),
        },
      },
      include: { flashcards: true },
    });

    return NextResponse.json(flashcardSet);
  } catch (error: any) {
    console.error("Flashcard generation error:", error);
    const message = error?.message?.includes("GEMINI_API_KEY")
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env."
      : "Failed to generate flashcards";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
