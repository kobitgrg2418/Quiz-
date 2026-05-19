import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const { answers, timeTaken } = await req.json();

    // Verify quiz ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: "asc" } },
        document: { select: { userId: true } },
      },
    });

    if (!quiz || quiz.document.userId !== session.user.id) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Calculate score
    let correctCount = 0;
    const attemptAnswers: { questionId: string; userAnswer: string; isCorrect: boolean }[] = [];

    for (const question of quiz.questions) {
      const userAnswer = answers[question.order.toString()] || "";
      const isCorrect = userAnswer === question.answer;
      if (isCorrect) correctCount++;

      attemptAnswers.push({
        questionId: question.id,
        userAnswer: String(userAnswer),
        isCorrect,
      });
    }

    const totalPoints = quiz.questions.length;
    const score = totalPoints > 0 ? (correctCount / totalPoints) * 100 : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score: Math.round(score),
        totalPoints,
        timeTaken: Math.max(0, Number(timeTaken) || 0),
        completedAt: new Date(),
        answers: {
          create: attemptAnswers,
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json({
      id: attempt.id,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      timeTaken: attempt.timeTaken,
      correct: correctCount,
      total: totalPoints,
    });
  } catch (error) {
    console.error("Quiz attempt save error:", error);
    return NextResponse.json(
      { error: "Failed to save quiz attempt" },
      { status: 500 }
    );
  }
}
