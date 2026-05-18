import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = req.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // SQLite uses LIKE for case-insensitive search (no "mode: insensitive")
    const [documents, quizzes, flashcardSets, notes] = await Promise.all([
      prisma.document.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query } },
            { fileName: { contains: query } },
          ],
        },
        take: 10,
      }),
      prisma.quiz.findMany({
        where: {
          title: { contains: query },
          document: { userId: session.user.id },
        },
        take: 10,
      }),
      prisma.flashcardSet.findMany({
        where: {
          userId: session.user.id,
          title: { contains: query },
        },
        take: 10,
      }),
      prisma.note.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({ documents, quizzes, flashcardSets, notes });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
