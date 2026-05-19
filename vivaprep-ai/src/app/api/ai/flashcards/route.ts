import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFlashcards } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";
import { rateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [sets, total] = await Promise.all([
      prisma.flashcardSet.findMany({
        where: { userId: session.user.id },
        include: {
          document: { select: { title: true } },
          flashcards: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.flashcardSet.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data: sets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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

    const rl = rateLimit(`ai:${session.user.id}`, AI_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rl.resetInSeconds}s` },
        { status: 429 }
      );
    }

    const { documentId, count = 15 } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, status: true, userId: true },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.status !== "READY") {
      return NextResponse.json({ error: "Document is still processing" }, { status: 400 });
    }

    const clampedCount = Math.max(1, Math.min(count, 50));

    const content = await getDocumentContext(documentId);
    const generated = await generateFlashcards(content, clampedCount);

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
