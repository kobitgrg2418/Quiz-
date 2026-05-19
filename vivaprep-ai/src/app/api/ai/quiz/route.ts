import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { generateQuiz } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        document: { userId: session.user.id },
      },
      include: {
        document: { select: { title: true } },
        questions: { select: { id: true } },
        attempts: {
          where: { userId: session.user.id },
          select: { score: true, totalPoints: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Quiz list error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, mode = "MEDIUM", type = "MIXED", count = 10 } = await req.json();

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
    const generated = await generateQuiz(content, mode, type, count);

    const quiz = await prisma.quiz.create({
      data: {
        title: generated.title,
        documentId,
        mode: mode as any,
        type: type as any,
        questions: {
          create: generated.questions.map((q, i) => ({
            type: q.type as any,
            question: q.question,
            options: q.options ? q.options : Prisma.JsonNull,
            answer: q.answer,
            explanation: q.explanation,
            order: i,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    const message = error?.message?.includes("GEMINI_API_KEY")
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env to enable quiz generation."
      : "Failed to generate quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
