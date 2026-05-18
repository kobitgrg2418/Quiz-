export interface QuizQuestion {
  type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "SHORT_ANSWER" | "SCENARIO";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
  example?: string;
  note?: string;
}

export interface GeneratedFlashcardSet {
  title: string;
  flashcards: GeneratedFlashcard[];
}

export interface GeneratedSummary {
  title: string;
  keyPoints: string[];
  concepts: { term: string; definition: string }[];
  importantNotes: string[];
}

export interface GeneratedVivaQuestions {
  basic: string[];
  conceptual: string[];
  followUp: string[];
  deep: string[];
}

export interface GeneratedInterviewQuestions {
  technical: { question: string; expectedAnswer: string }[];
  behavioral: { question: string; tip: string }[];
  scenario: { scenario: string; question: string }[];
}

export interface ChatMessageType {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface DocumentWithRelations {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: Date;
  topics: { id: string; name: string }[];
  _count?: {
    quizzes: number;
    flashcardSets: number;
    notes: number;
  };
}

export interface AnalyticsData {
  totalQuizzes: number;
  averageScore: number;
  totalFlashcards: number;
  studyStreak: number;
  weeklyProgress: { day: string; quizzes: number; flashcards: number }[];
  topicMastery: { topic: string; mastery: number }[];
  recentActivity: { type: string; title: string; date: string }[];
}
