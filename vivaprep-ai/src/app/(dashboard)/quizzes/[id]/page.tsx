"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockQuestions = [
  {
    id: "1",
    type: "MCQ" as const,
    question: "What is the primary purpose of a loss function in machine learning?",
    options: ["A. To measure the difference between predicted and actual values", "B. To increase the model complexity", "C. To reduce training time", "D. To add more features"],
    answer: "A",
    explanation: "A loss function quantifies how well a model's predictions match the actual target values. It provides a measure that the optimization algorithm tries to minimize.",
  },
  {
    id: "2",
    type: "TRUE_FALSE" as const,
    question: "Gradient descent always finds the global minimum of a loss function.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Gradient descent can get stuck in local minima, especially in non-convex functions. Only for convex functions is it guaranteed to find the global minimum.",
  },
  {
    id: "3",
    type: "MCQ" as const,
    question: "Which activation function is most commonly used in hidden layers of deep neural networks?",
    options: ["A. Sigmoid", "B. ReLU", "C. Tanh", "D. Softmax"],
    answer: "B",
    explanation: "ReLU (Rectified Linear Unit) is the most widely used activation function in hidden layers due to its simplicity and effectiveness in addressing the vanishing gradient problem.",
  },
  {
    id: "4",
    type: "MCQ" as const,
    question: "What does overfitting mean in machine learning?",
    options: ["A. The model is too simple", "B. The model performs well on training data but poorly on unseen data", "C. The model trains too slowly", "D. The model has too few parameters"],
    answer: "B",
    explanation: "Overfitting occurs when a model learns the training data too well, including noise and outliers, leading to poor generalization on new, unseen data.",
  },
  {
    id: "5",
    type: "TRUE_FALSE" as const,
    question: "Regularization techniques like L1 and L2 help prevent overfitting.",
    options: ["True", "False"],
    answer: "True",
    explanation: "Regularization adds a penalty term to the loss function that discourages the model from learning overly complex patterns, thus reducing overfitting.",
  },
];

type QuizState = "intro" | "active" | "review" | "results";

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state === "active") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const question = mockQuestions[currentQ];
  const progress = ((currentQ + 1) / mockQuestions.length) * 100;
  const isAnswered = answers[currentQ] !== undefined;
  const isCorrect = answers[currentQ] === question?.answer;

  const score = Object.entries(answers).reduce((acc, [idx, ans]) => {
    return acc + (mockQuestions[Number(idx)].answer === ans ? 1 : 0);
  }, 0);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: answer }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQ < mockQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setState("results");
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
                <h2 className="text-xl font-bold">ML Fundamentals Quiz</h2>
                <p className="text-muted-foreground mt-2">{mockQuestions.length} questions &middot; Medium difficulty</p>
              </div>
              <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                <div className="text-center">
                  <div className="font-semibold text-foreground">{mockQuestions.length}</div>
                  Questions
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">~10 min</div>
                  Duration
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">Medium</div>
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
    const percentage = Math.round((score / mockQuestions.length) * 100);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="text-center overflow-hidden">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-8 text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Trophy className="h-16 w-16 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold">Quiz Complete!</h2>
              <div className="text-5xl font-bold mt-4">{percentage}%</div>
              <p className="opacity-80 mt-2">{score}/{mockQuestions.length} correct</p>
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
                  <div className="font-semibold text-red-600">{mockQuestions.length - score}</div>
                  <div className="text-muted-foreground">Wrong</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setState("intro"); setCurrentQ(0); setAnswers({}); setTimer(0); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Retry
                </Button>
                <Link href="/quizzes" className="flex-1">
                  <Button variant="gradient" className="w-full">
                    Done
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
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
            {currentQ + 1}/{mockQuestions.length}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
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
                <Badge variant="secondary" className="mb-3">{question.type === "MCQ" ? "Multiple Choice" : "True / False"}</Badge>
                <h3 className="text-lg font-semibold leading-relaxed">{question.question}</h3>
              </div>

              <div className="space-y-3">
                {question.options?.map((option, idx) => {
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

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
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
                  {currentQ < mockQuestions.length - 1 ? (
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
