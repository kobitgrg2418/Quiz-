import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateInterviewQuestions } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";
import { rateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";
import { isValidId, safeError } from "@/lib/security";

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

    if (!documentId || !isValidId(documentId)) {
      return NextResponse.json({ error: "Valid document ID required" }, { status: 400 });
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

    const content = await getDocumentContext(documentId);
    const questions = await generateInterviewQuestions(content);

    return NextResponse.json(questions);
  } catch (error: unknown) {
    console.error("Interview generation error:", safeError(error));
    const errorMessage = (error instanceof Error && error.message?.includes("GEMINI_API_KEY"))
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env."
      : "Failed to generate interview questions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
