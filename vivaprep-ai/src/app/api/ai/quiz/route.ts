import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, QuizMode, QuizType, QuestionType } from "@/generated/prisma/client";
import { generateQuiz } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";
import { rateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";
import { isValidId, safeError } from "@/lib/security";

const VALID_MODES = Object.values(QuizMode);
const VALID_TYPES = Object.values(QuizType);

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

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
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
        skip,
        take: limit,
      }),
      prisma.quiz.count({
        where: { document: { userId: session.user.id } },
      }),
    ]);

    return NextResponse.json({
      data: quizzes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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

    const rl = rateLimit(`ai:${session.user.id}`, AI_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rl.resetInSeconds}s` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const documentId = typeof body.documentId === "string" ? body.documentId : "";
    const mode = typeof body.mode === "string" ? body.mode : "MEDIUM";
    const type = typeof body.type === "string" ? body.type : "MIXED";
    const count = typeof body.count === "number" ? body.count : 10;

    if (!documentId || !isValidId(documentId)) {
      return NextResponse.json({ error: "Valid document ID required" }, { status: 400 });
    }

    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid quiz mode" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
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

    const clampedCount = Math.max(1, Math.min(count, 30));

    const content = await getDocumentContext(documentId);
    const generated = await generateQuiz(content, mode, type, clampedCount);

    const quiz = await prisma.quiz.create({
      data: {
        title: generated.title,
        documentId,
        mode: mode as QuizMode,
        type: type as QuizType,
        questions: {
          create: generated.questions.map((q, i) => ({
            type: (q.type || "MCQ") as QuestionType,
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
  } catch (error: unknown) {
    console.error("Quiz generation error:", safeError(error));
    const message = (error instanceof Error && error.message?.includes("GEMINI_API_KEY"))
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env to enable quiz generation."
      : "Failed to generate quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
