import pdf from "pdf-parse";
import { parseOffice } from "officeparser";
import { generateEmbedding } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export async function processPDF(
  buffer: Buffer,
  documentId: string
): Promise<{ text: string; pageCount: number }> {
  return processDocument(buffer, documentId, "application/pdf");
}

export async function processDocument(
  buffer: Buffer,
  documentId: string,
  mimeType: string
): Promise<{ text: string; pageCount: number }> {
  const { text, pageCount } = await extractText(buffer, mimeType);

  await prisma.document.update({
    where: { id: documentId },
    data: { pageCount },
  });

  const chunks = chunkText(text);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let embedding: number[] = [];

    try {
      embedding = await generateEmbedding(chunk.content);
    } catch {
      // Continue without embedding if OpenAI API key not set
    }

    await prisma.documentChunk.create({
      data: {
        documentId,
        content: chunk.content,
        pageNumber: chunk.page,
        chunkIndex: i,
        embedding: JSON.stringify(embedding),
        metadata: { wordCount: chunk.content.split(/\s+/).length },
      },
    });
  }

  const topics = await detectTopics(text);
  for (const topic of topics) {
    await prisma.topic.create({
      data: { name: topic, documentId },
    });
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "READY" },
  });

  return { text, pageCount };
}

async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; pageCount: number }> {
  if (mimeType === "application/pdf") {
    const data = await pdf(buffer);
    return { text: data.text, pageCount: data.numpages };
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    const ast = await parseOffice(buffer);
    const text = ast.toText();
    const slideCount = ast.metadata?.pages ?? (text.match(/\n{2,}/g) || []).length + 1;
    return { text, pageCount: slideCount };
  }

  if (mimeType === "text/markdown" || mimeType === "text/plain") {
    const text = buffer.toString("utf-8");
    return { text, pageCount: 1 };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

function chunkText(text: string): { content: string; page: number }[] {
  const chunks: { content: string; page: number }[] = [];
  const pages = text.split(/\f/);

  let currentChunk = "";
  let currentPage = 1;

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageText = pages[pageIdx].trim();
    if (!pageText) continue;

    const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > CHUNK_SIZE) {
        if (currentChunk.trim()) {
          chunks.push({ content: currentChunk.trim(), page: currentPage });
        }
        const overlapStart = Math.max(0, currentChunk.length - CHUNK_OVERLAP);
        currentChunk = currentChunk.slice(overlapStart) + sentence;
        currentPage = pageIdx + 1;
      } else {
        currentChunk += " " + sentence;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), page: currentPage });
  }

  return chunks;
}

async function detectTopics(text: string): Promise<string[]> {
  const { generateCompletion } = await import("@/lib/ai");

  try {
    const result = await generateCompletion(
      "Extract 3-8 main topics from this lecture content. Return JSON: { \"topics\": [\"topic1\", \"topic2\"] }",
      text.slice(0, 4000)
    );

    const parsed = JSON.parse(result);
    return parsed.topics || [];
  } catch {
    return ["General"];
  }
}

export async function getDocumentContext(documentId: string): Promise<string> {
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
    orderBy: { chunkIndex: "asc" },
  });

  return chunks.map((c) => c.content).join("\n\n");
}

export async function searchChunks(
  documentId: string,
  query: string,
  topK: number = 5
): Promise<string> {
  const queryEmbedding = await generateEmbedding(query);
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
  });

  const scored = chunks.map((chunk) => ({
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, JSON.parse(chunk.embedding || "[]")),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, topK)
    .map((c) => c.content)
    .join("\n\n");
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
