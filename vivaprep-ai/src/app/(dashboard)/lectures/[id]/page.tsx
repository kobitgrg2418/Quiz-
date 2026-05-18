"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  BrainCircuit,
  Layers,
  GraduationCap,
  Briefcase,
  StickyNote,
  MessageSquare,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const actions = [
  { id: "quiz", label: "Generate Quiz", icon: BrainCircuit, desc: "Create AI-powered quiz questions", color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
  { id: "flashcards", label: "Create Flashcards", icon: Layers, desc: "Auto-generate study flashcards", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "summary", label: "Key Points", icon: StickyNote, desc: "Extract important concepts", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { id: "viva", label: "Viva Questions", icon: GraduationCap, desc: "Generate viva exam questions", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "interview", label: "Interview Prep", icon: Briefcase, desc: "Create interview questions", color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30" },
  { id: "chat", label: "Chat with PDF", icon: MessageSquare, desc: "Ask questions about content", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
];

export default function LectureDetailPage() {
  const params = useParams();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setGenerating(type);
    toast.info(`Generating ${type}...`);

    try {
      const res = await fetch(`/api/ai/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: params.id }),
      });

      if (res.ok) {
        toast.success(`${type} generated successfully!`);
      } else {
        toast.error(`Failed to generate ${type}`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lectures">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Machine Learning Fundamentals</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success">Ready</Badge>
            <span className="text-sm text-muted-foreground">45 pages &middot; Uploaded Jan 15, 2025</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="content">Document Content</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action, i) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  onClick={() => action.id === "chat" ? null : handleGenerate(action.id)}
                >
                  <CardContent className="p-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg}`}>
                      {generating === action.id ? (
                        <Loader2 className={`h-6 w-6 ${action.color} animate-spin`} />
                      ) : (
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold">{action.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Machine Learning", "Neural Networks", "Supervised Learning", "Deep Learning", "Optimization"].map((topic) => (
                  <Badge key={topic} variant="secondary" className="px-3 py-1">
                    {topic}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This document covers the fundamentals of machine learning including supervised and unsupervised learning,
                  neural network architectures, optimization techniques, and practical applications. Key topics include
                  gradient descent, backpropagation, convolutional neural networks, and model evaluation metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { type: "Quiz", count: "10 questions", time: "2 hours ago" },
                  { type: "Flashcards", count: "15 cards", time: "1 day ago" },
                  { type: "Summary", count: "Concise mode", time: "1 day ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <span className="font-medium text-sm">{item.type}</span>
                      <span className="text-sm text-muted-foreground ml-2">{item.count}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
