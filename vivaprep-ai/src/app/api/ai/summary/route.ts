import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NoteMode } from "@/generated/prisma/client";
import { generateSummary } from "@/services/ai/generators";
import { getDocumentContext } from "@/services/ai/pdf-processor";
import { rateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";

const VALID_MODES = Object.values(NoteMode);

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

    const { documentId, mode = "CONCISE" } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: "Invalid summary mode" }, { status: 400 });
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
        mode: mode as NoteMode,
        documentId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ note, summary: generated });
  } catch (error) {
    console.error("Summary generation error:", error);
    const errorMessage = (error as any)?.message?.includes("GEMINI_API_KEY")
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env."
      : "Failed to generate summary";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
