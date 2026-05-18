import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [totalQuizzes, quizAttempts, flashcardSets, studySessions] =
      await Promise.all([
        prisma.quiz.count(),
        prisma.quizAttempt.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.flashcardSet.count({ where: { userId } }),
        prisma.studySession.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
      ]);

    const averageScore =
      quizAttempts.length > 0
        ? quizAttempts.reduce((acc, a) => acc + a.score, 0) /
          quizAttempts.length
        : 0;

    const totalStudyTime = studySessions.reduce(
      (acc, s) => acc + s.duration,
      0
    );

    return NextResponse.json({
      totalQuizzes,
      averageScore: Math.round(averageScore),
      totalFlashcards: flashcardSets,
      totalStudyTime,
      recentAttempts: quizAttempts.slice(0, 10),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
