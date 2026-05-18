import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSummary } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, mode = "CONCISE" } = await req.json();

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
    const generated = await generateSummary(content, mode);

    const noteContent = [
      "# " + generated.title,
      "",
      "## Key Points",
      ...generated.keyPoints.map((p) => `- ${p}`),
      "",
      "## Important Concepts",
      ...generated.concepts.map((c) => `**${c.term}**: ${c.definition}`),
      "",
      "## Notes",
      ...generated.importantNotes.map((n) => `- ${n}`),
    ].join("\n");

    const note = await prisma.note.create({
      data: {
        title: generated.title,
        content: noteContent,
        mode: mode as any,
        documentId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ note, summary: generated });
  } catch (error) {
    console.error("Summary generation error:", error);
    const errorMessage = (error as any)?.message?.includes("OPENAI_API_KEY")
      ? "OpenAI API key not configured. Please contact administrator."
      : "Failed to generate summary";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
