"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionData {
  id: string;
  type: string;
  question: string;
  options: string[] | null;
  answer: string;
  explanation: string | null;
  order: number;
}

interface QuizDetail {
  id: string;
  title: string;
  mode: string;
  questions: QuestionData[];
}

type QuizState = "loading" | "intro" | "active" | "results";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [error, setError] = useState("");
  const [state, setState] = useState<QuizState>("loading");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/ai/quiz/${id}`);
        if (!res.ok) throw new Error("Quiz not found");
        const data = await res.json();
        data.questions.sort((a: QuestionData, b: QuestionData) => a.order - b.order);
        setQuiz(data);
        setState("intro");
      } catch {
        setError("Failed to load quiz");
        setState("intro");
      }
    }
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === "active") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const questions = quiz?.questions || [];
  const question = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const isAnswered = answers[currentQ] !== undefined;
  const isCorrect = question ? answers[currentQ] === question.answer : false;

  const score = Object.entries(answers).reduce((acc, [idx, ans]) => {
    const q = questions[Number(idx)];
    return acc + (q && q.answer === ans ? 1 : 0);
  }, 0);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: answer }));
    setShowExplanation(true);
  };

  const saveAttempt = async () => {
    try {
      await fetch(`/api/ai/quiz/${id}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken: timer }),
      });
    } catch {
      // Silently fail — results are still shown locally
    }
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      saveAttempt();
      setState("results");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-md w-full">
          <CardContent className="p-8 space-y-4">
            <p className="text-muted-foreground">{error || "Quiz not found"}</p>
            <Link href="/quizzes">
              <Button variant="gradient">Back to Quizzes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "intro") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="text-center">
            <CardContent className="p-8 space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{quiz.title}</h2>
                <p className="text-muted-foreground mt-2">{questions.length} questions &middot; {quiz.mode.charAt(0).toUpperCase() + quiz.mode.slice(1).toLowerCase()} difficulty</p>
              </div>
              <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="font-semibold text-foreground">{questions.length}</div>
                  Questions
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">~{Math.max(5, questions.length * 2)} min</div>
                  Duration
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground capitalize">{quiz.mode.charAt(0).toUpperCase() + quiz.mode.slice(1).toLowerCase()}</div>
                  Difficulty
                </div>
              </div>
              <Button variant="gradient" size="lg" className="w-full" onClick={() => setState("active")}>
                Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (state === "results") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="text-center overflow-hidden">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                <Trophy className="h-16 w-16 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold">Quiz Complete!</h2>
              <div className="text-5xl font-bold mt-4">{percentage}%</div>
              <p className="opacity-80 mt-2">{score}/{questions.length} correct</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{formatTime(timer)}</div>
                  <div className="text-muted-foreground">Time</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-emerald-600">{score}</div>
                  <div className="text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{questions.length - score}</div>
                  <div className="text-muted-foreground">Wrong</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setState("intro"); setCurrentQ(0); setAnswers({}); setTimer(0); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Retry
                </Button>
                <Link href="/quizzes" className="flex-1">
                  <Button variant="gradient" className="w-full">Done</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!question) return null;

  const rawOptions = Array.isArray(question.options) ? question.options : [];
  const options: string[] = rawOptions.length > 0
    ? rawOptions
    : question.type === "TRUE_FALSE"
      ? ["True", "False"]
      : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/quizzes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-3 w-3" /> Exit
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {formatTime(timer)}
          </Badge>
          <Badge variant="secondary">
            {currentQ + 1}/{questions.length}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {question.type === "MCQ" ? "Multiple Choice" : question.type === "TRUE_FALSE" ? "True / False" : question.type.replace("_", " ")}
                </Badge>
                <h3 className="text-lg font-semibold leading-relaxed">{question.question}</h3>
              </div>

              <div className="space-y-3">
                {options.map((option, idx) => {
                  const optionKey = question.type === "MCQ" ? option.charAt(0) : option;
                  const selected = answers[currentQ] === optionKey;
                  const correct = question.answer === optionKey;

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!isAnswered ? { scale: 1.01 } : {}}
                      whileTap={!isAnswered ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(optionKey)}
                      className={cn(
                        "w-full text-left rounded-xl border-2 p-4 text-sm font-medium transition-all duration-200",
                        !isAnswered && "hover:border-violet-400 hover:bg-violet-500/5 cursor-pointer",
                        isAnswered && correct && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                        isAnswered && selected && !correct && "border-red-500 bg-red-50 dark:bg-red-900/20",
                        !isAnswered && "border-border",
                        isAnswered && !selected && !correct && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-1">{option}</span>
                        {isAnswered && correct && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                        {isAnswered && selected && !correct && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {showExplanation && question.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-muted/50 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={cn("text-sm font-medium", isCorrect ? "text-emerald-600" : "text-red-600")}>
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswered && (
                <Button variant="gradient" className="w-full" onClick={nextQuestion}>
                  {currentQ < questions.length - 1 ? (
                    <>Next Question <ArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>See Results <Trophy className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
