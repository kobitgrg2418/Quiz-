"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  example: string | null;
  note: string | null;
  order: number;
}

interface FlashcardSetDetail {
  id: string;
  title: string;
  document: { title: string };
  flashcards: FlashcardData[];
}

export default function FlashcardStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [set, setSet] = useState<FlashcardSetDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, "easy" | "normal" | "hard">>({});
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    async function fetchSet() {
      try {
        const res = await fetch(`/api/ai/flashcards/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        data.flashcards.sort((a: FlashcardData, b: FlashcardData) => a.order - b.order);
        setSet(data);
      } catch {
        setError("Failed to load flashcard set");
      } finally {
        setLoading(false);
      }
    }
    fetchSet();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading flashcards...</span>
        </div>
      </div>
    );
  }

  if (error || !set || set.flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-md w-full p-8">
          <p className="text-muted-foreground mb-4">{error || "No flashcards found"}</p>
          <Link href="/flashcards">
            <Button variant="gradient">Back to Flashcards</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const cards = set.flashcards;
  const card = cards[currentIdx];
  const progress = ((currentIdx + 1) / cards.length) * 100;

  const navigate = (dir: number) => {
    setDirection(dir);
    setIsFlipped(false);
    setCurrentIdx((prev) => {
      const next = prev + dir;
      if (next < 0) return cards.length - 1;
      if (next >= cards.length) return 0;
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
          <Badge variant="secondary">{currentIdx + 1}/{cards.length}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={shuffle}>
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

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
                  <motion.div initial={{ rotateY: 0 }} className="space-y-4">
                    <Badge variant="secondary" className="text-xs">
                      {currentIdx + 1} of {cards.length}
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

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {isFlipped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
            <Button variant="outline" size="sm" className={cn("rounded-full", ratings[currentIdx] === "hard" && "border-red-500 bg-red-50")} onClick={() => rate("hard")}>
              <ThumbsDown className="mr-1 h-3 w-3 text-red-500" /> Hard
            </Button>
            <Button variant="outline" size="sm" className={cn("rounded-full", ratings[currentIdx] === "normal" && "border-amber-500 bg-amber-50")} onClick={() => rate("normal")}>
              <Minus className="mr-1 h-3 w-3 text-amber-500" /> Normal
            </Button>
            <Button variant="outline" size="sm" className={cn("rounded-full", ratings[currentIdx] === "easy" && "border-emerald-500 bg-emerald-50")} onClick={() => rate("easy")}>
              <ThumbsUp className="mr-1 h-3 w-3 text-emerald-500" /> Easy
            </Button>
          </motion.div>
        )}

        <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-center gap-6 text-sm text-muted-foreground">
        <span className="text-emerald-600">{Object.values(ratings).filter((r) => r === "easy").length} Easy</span>
        <span className="text-amber-600">{Object.values(ratings).filter((r) => r === "normal").length} Normal</span>
        <span className="text-red-600">{Object.values(ratings).filter((r) => r === "hard").length} Hard</span>
      </div>
    </div>
  );
}
