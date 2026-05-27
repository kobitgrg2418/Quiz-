import { generateCompletion } from "@/lib/ai";
import {
  QUIZ_SYSTEM_PROMPT,
  FLASHCARD_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  VIVA_SYSTEM_PROMPT,
  INTERVIEW_SYSTEM_PROMPT,
  buildQuizPrompt,
  buildFlashcardPrompt,
  buildSummaryPrompt,
  buildVivaPrompt,
  buildInterviewPrompt,
} from "./prompts";
import type {
  GeneratedQuiz,
  GeneratedFlashcardSet,
  GeneratedSummary,
  GeneratedVivaQuestions,
  GeneratedInterviewQuestions,
} from "@/types";

function parseJSON<T>(raw: string): T {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`AI returned invalid JSON: ${text.slice(0, 200)}`);
  }
}

export async function generateQuiz(
  content: string,
  mode: string = "MEDIUM",
  type: string = "MIXED",
  count: number = 10
): Promise<GeneratedQuiz> {
  const result = await generateCompletion(
    QUIZ_SYSTEM_PROMPT,
    buildQuizPrompt(content, mode, type, count),
    { maxTokens: Math.max(8192, count * 400) }
  );
  return parseJSON<GeneratedQuiz>(result);
}

export async function generateFlashcards(
  content: string,
  count: number = 15
): Promise<GeneratedFlashcardSet> {
  const result = await generateCompletion(
    FLASHCARD_SYSTEM_PROMPT,
    buildFlashcardPrompt(content, count)
  );
  return parseJSON<GeneratedFlashcardSet>(result);
}

export async function generateSummary(
  content: string,
  mode: string = "CONCISE"
): Promise<GeneratedSummary> {
  const result = await generateCompletion(
    SUMMARY_SYSTEM_PROMPT,
    buildSummaryPrompt(content, mode)
  );
  return parseJSON<GeneratedSummary>(result);
}

export async function generateVivaQuestions(
  content: string
): Promise<GeneratedVivaQuestions> {
  const result = await generateCompletion(
    VIVA_SYSTEM_PROMPT,
    buildVivaPrompt(content)
  );
  return parseJSON<GeneratedVivaQuestions>(result);
}

export async function generateInterviewQuestions(
  content: string
): Promise<GeneratedInterviewQuestions> {
  const result = await generateCompletion(
    INTERVIEW_SYSTEM_PROMPT,
    buildInterviewPrompt(content)
  );
  return parseJSON<GeneratedInterviewQuestions>(result);
}
