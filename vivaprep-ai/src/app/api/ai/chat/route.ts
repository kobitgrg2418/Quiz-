import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateStreamingCompletion } from "@/lib/openai";
import { searchChunks } from "@/services/ai/pdf-processor";
import { CHAT_SYSTEM_PROMPT } from "@/services/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, message } = await req.json();

    if (!documentId || !message) {
      return NextResponse.json(
        { error: "Document ID and message required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.status !== "READY") {
      return NextResponse.json(
        { error: "Document not found or not ready" },
        { status: 404 }
      );
    }

    const relevantContext = await searchChunks(documentId, message, 5);
    const systemPrompt = CHAT_SYSTEM_PROMPT.replace("{context}", relevantContext);

    const stream = await generateStreamingCompletion(systemPrompt, message);

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullResponse += content;
    }

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
  } catch (error: any) {
    console.error("Chat error:", error);
    const message = error?.message?.includes("OPENAI_API_KEY")
      ? "OpenAI API key not configured. Add OPENAI_API_KEY to .env to enable AI chat."
      : "Failed to process chat message";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
