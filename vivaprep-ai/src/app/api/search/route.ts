import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, SEARCH_RATE_LIMIT } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(`search:${session.user.id}`, SEARCH_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Search rate limit exceeded. Try again in ${rl.resetInSeconds}s` },
        { status: 429 }
      );
    }

    const query = req.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // PostgreSQL requires mode: "insensitive" for case-insensitive contains
    const [documents, quizzes, flashcardSets, notes] = await Promise.all([
      prisma.document.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { fileName: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.quiz.findMany({
        where: {
          title: { contains: query, mode: "insensitive" },
          document: { userId: session.user.id },
        },
        take: 10,
      }),
      prisma.flashcardSet.findMany({
        where: {
          userId: session.user.id,
          title: { contains: query, mode: "insensitive" },
        },
        take: 10,
      }),
      prisma.note.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
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
