import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateInterviewQuestions } from "@/services/ai/generators";
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
    });

    if (!document || document.status !== "READY") {
      return NextResponse.json({ error: "Document not found or not ready" }, { status: 404 });
    }

    const content = await getDocumentContext(documentId);
    const questions = await generateInterviewQuestions(content);

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Interview generation error:", error);
    const errorMessage = (error as any)?.message?.includes("OPENAI_API_KEY")
      ? "OpenAI API key not configured. Please contact administrator."
      : "Failed to generate interview questions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
