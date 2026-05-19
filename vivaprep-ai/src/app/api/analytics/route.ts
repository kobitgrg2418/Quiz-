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

    const [totalQuizzes, quizAttempts, flashcardSets, studySessions, totalNotes, totalDocuments] =
      await Promise.all([
        prisma.quiz.count({ where: { document: { userId } } }),
        prisma.quizAttempt.findMany({
          where: { userId },
          include: { quiz: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.flashcardSet.count({ where: { userId } }),
        prisma.studySession.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
        prisma.note.count({ where: { userId } }),
        prisma.document.count({ where: { userId } }),
      ]);

    const averageScore =
      quizAttempts.length > 0
        ? quizAttempts.reduce(
            (acc, a) =>
              acc + Math.round((a.score / Math.max(a.totalPoints, 1)) * 100),
            0
          ) / quizAttempts.length
        : 0;

    const totalStudyTime = studySessions.reduce(
      (acc, s) => acc + s.duration,
      0
    );

    // Calculate streak (consecutive days with activity)
    const attemptDates = quizAttempts.map((a) =>
      new Date(a.createdAt).toDateString()
    );
    const uniqueDays = [...new Set(attemptDates)];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (uniqueDays.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return NextResponse.json({
      totalQuizzes,
      averageScore: Math.round(averageScore),
      totalFlashcards: flashcardSets,
      totalStudyTime,
      totalNotes,
      totalDocuments,
      streak,
      recentAttempts: quizAttempts.slice(0, 10).map((a) => ({
        id: a.id,
        score: a.score,
        totalPoints: a.totalPoints,
        timeTaken: a.timeTaken,
        quizTitle: a.quiz.title,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
