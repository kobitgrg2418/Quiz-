"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const mockFlashcards = [
  { id: "1", front: "What is supervised learning?", back: "A type of machine learning where the model is trained on labeled data, learning to map inputs to known outputs.", example: "Predicting house prices based on features like size and location.", note: "Most common type of ML in production." },
  { id: "2", front: "What is gradient descent?", back: "An optimization algorithm used to minimize the loss function by iteratively updating model parameters in the direction of steepest descent.", example: "Like rolling a ball downhill to find the lowest point.", note: "Learning rate is a critical hyperparameter." },
  { id: "3", front: "What is overfitting?", back: "When a model learns the training data too well, including noise, leading to poor generalization on unseen data.", example: "A model that memorizes exam answers but can't solve new problems.", note: "Regularization and more data help prevent this." },
  { id: "4", front: "What is a neural network?", back: "A computational model inspired by biological neural networks, consisting of layers of interconnected nodes (neurons) that process information.", example: "Image recognition classifying photos of cats vs dogs.", note: "Deep learning uses networks with many layers." },
  { id: "5", front: "What is backpropagation?", back: "An algorithm for training neural networks by computing gradients of the loss function with respect to each weight, propagating errors backwards through the network.", example: "Adjusting weights after each training batch to reduce prediction errors.", note: "Relies on the chain rule of calculus." },
];

export default function FlashcardStudyPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, "easy" | "normal" | "hard">>({});
  const [direction, setDirection] = useState(0);

  const card = mockFlashcards[currentIdx];
  const progress = ((currentIdx + 1) / mockFlashcards.length) * 100;

  const navigate = (dir: number) => {
    setDirection(dir);
    setIsFlipped(false);
    setCurrentIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return mockFlashcards.length - 1;
      if (next >= mockFlashcards.length) return 0;
      return next;
    });
  };

  const rate = (difficulty: "easy" | "normal" | "hard") => {
    setRatings((prev) => ({ ...prev, [currentIdx]: difficulty }));
    navigate(1);
  };

  const shuffle = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/flashcards">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-3 w-3" /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{currentIdx + 1}/{mockFlashcards.length}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={shuffle}>
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <div className="perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIdx}-${isFlipped}`}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="min-h-[350px] cursor-pointer select-none"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flex flex-col items-center justify-center p-8 min-h-[350px] text-center">
                {!isFlipped ? (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    className="space-y-4"
                  >
                    <Badge variant="secondary" className="text-xs">
                      {currentIdx + 1} of {mockFlashcards.length}
                    </Badge>
                    <h2 className="text-xl font-semibold leading-relaxed">{card.front}</h2>
                    <p className="text-sm text-muted-foreground">Tap to reveal answer</p>
                  </motion.div>
                ) : (
                  <motion.div className="space-y-4 w-full">
                    <p className="text-base leading-relaxed">{card.back}</p>
                    {card.example && (
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-left">
                        <div className="text-xs font-medium text-blue-600 mb-1">Example</div>
                        <p className="text-sm text-muted-foreground">{card.example}</p>
                      </div>
                    )}
                    {card.note && (
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-left">
                        <div className="text-xs font-medium text-amber-600 mb-1">Note</div>
                        <p className="text-sm text-muted-foreground">{card.note}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-full", ratings[currentIdx] === "hard" && "border-red-500 bg-red-50")}
              onClick={() => rate("hard")}
            >
              <ThumbsDown className="mr-1 h-3 w-3 text-red-500" /> Hard
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-full", ratings[currentIdx] === "normal" && "border-amber-500 bg-amber-50")}
              onClick={() => rate("normal")}
            >
              <Minus className="mr-1 h-3 w-3 text-amber-500" /> Normal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-full", ratings[currentIdx] === "easy" && "border-emerald-500 bg-emerald-50")}
              onClick={() => rate("easy")}
            >
              <ThumbsUp className="mr-1 h-3 w-3 text-emerald-500" /> Easy
            </Button>
          </motion.div>
        )}

        <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 text-sm text-muted-foreground">
        <span className="text-emerald-600">{Object.values(ratings).filter((r) => r === "easy").length} Easy</span>
        <span className="text-amber-600">{Object.values(ratings).filter((r) => r === "normal").length} Normal</span>
        <span className="text-red-600">{Object.values(ratings).filter((r) => r === "hard").length} Hard</span>
      </div>
    </div>
  );
}
