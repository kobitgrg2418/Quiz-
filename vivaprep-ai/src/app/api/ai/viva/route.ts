import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateVivaQuestions } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();

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

    const content = await getDocumentContext(documentId);
    const questions = await generateVivaQuestions(content);

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Viva generation error:", error);
    const errorMessage = (error as any)?.message?.includes("GEMINI_API_KEY")
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env."
      : "Failed to generate viva questions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
