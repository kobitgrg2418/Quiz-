import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStreamingCompletion } from "@/lib/ai";
import { searchChunks } from "@/services/ai/pdf-processor";
import { CHAT_SYSTEM_PROMPT } from "@/services/ai/prompts";
import { rateLimit, AI_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeInput, isValidId, safeError } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = req.nextUrl.searchParams.get("documentId");
    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { userId: true },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { documentId, userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 100,
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }
}

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
    const message = typeof body.message === "string" ? sanitizeInput(body.message) : "";

    if (!documentId || !isValidId(documentId)) {
      return NextResponse.json(
        { error: "Valid document ID required" },
        { status: 400 }
      );
    }

    if (!message || message.length > 10000) {
      return NextResponse.json(
        { error: "Message is required (max 10,000 characters)" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, status: true, userId: true },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.status !== "READY") {
      return NextResponse.json(
        { error: "Document is still processing" },
        { status: 400 }
      );
    }

    const relevantContext = await searchChunks(documentId, message, 5);
    const systemPrompt = CHAT_SYSTEM_PROMPT.replace("{context}", relevantContext);

    const fullResponse = await generateStreamingCompletion(systemPrompt, message);

    await prisma.chatMessage.createMany({
      data: [
        {
          documentId,
          userId: session.user.id,
          role: "user",
          content: message,
        },
        {
          documentId,
          userId: session.user.id,
          role: "assistant",
          content: fullResponse,
        },
      ],
    });

    return NextResponse.json({ response: fullResponse });
  } catch (error: unknown) {
    console.error("Chat error:", safeError(error));
    const msg = (error instanceof Error && error.message?.includes("GEMINI_API_KEY"))
      ? "Gemini API key not configured. Add GEMINI_API_KEY to .env to enable AI chat."
      : "Failed to process chat message";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
