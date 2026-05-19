import { GoogleGenAI } from "@google/genai";

let _genai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file to enable AI features."
    );
  }
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _genai;
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const genai = getGenAI();

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 4096,
      responseMimeType: "application/json",
    },
  });

  return response.text ?? "";
}

export async function generateStreamingCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const genai = getGenAI();

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      temperature: 0.7,
    },
  });

  return response.text ?? "";
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const genai = getGenAI();

  const response = await genai.models.embedContent({
    model: "text-embedding-004",
    contents: text,
  });

  return response.embeddings?.[0]?.values ?? [];
}
