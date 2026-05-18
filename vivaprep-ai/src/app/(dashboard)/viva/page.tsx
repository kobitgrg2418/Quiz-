"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, MessageSquare, Sparkles, ChevronRight, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const vivaQuestions = {
  basic: [
    "What is machine learning and how does it differ from traditional programming?",
    "Explain the difference between supervised and unsupervised learning.",
    "What is a training set, validation set, and test set?",
    "Define bias and variance in the context of machine learning.",
    "What are the main types of machine learning algorithms?",
  ],
  conceptual: [
    "How does the bias-variance tradeoff affect model performance?",
    "Explain how gradient descent optimizes a neural network.",
    "What role does regularization play in preventing overfitting?",
    "Compare and contrast batch gradient descent with stochastic gradient descent.",
    "How do convolutional neural networks process spatial information?",
  ],
  followUp: [
    "You mentioned regularization - can you explain L1 vs L2 regularization?",
    "How would you choose between these approaches in practice?",
    "What metrics would you use to evaluate this type of model?",
    "Can you give a real-world example where this would fail?",
    "How would you explain this concept to a non-technical stakeholder?",
  ],
  deep: [
    "Derive the backpropagation algorithm for a simple two-layer network.",
    "How does attention mechanism in transformers address limitations of RNNs?",
    "Discuss the theoretical foundations of why deep learning works.",
    "How would you design an ML system for a safety-critical application?",
    "What are the ethical implications of the model choices you've described?",
  ],
};

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const chatMessages: ChatMsg[] = [
  { role: "assistant", content: "Welcome to your Viva practice session. I'll be your examiner today. Let's begin with a fundamental question: What is machine learning and how does it differ from traditional programming?" },
];

export default function VivaPage() {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("basic");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: input },
      { role: "assistant" as const, content: "That's a good start. Let me probe a bit deeper - can you elaborate on the specific mechanisms that enable a machine learning model to 'learn' from data? Think about what happens mathematically during the training process." },
    ]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Viva Preparation</h1>
        <p className="text-muted-foreground mt-1">Practice for oral examinations with AI-generated questions</p>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
          <TabsTrigger value="practice">Practice Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(vivaQuestions).map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {vivaQuestions[activeCategory as keyof typeof vivaQuestions].map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-sm font-bold text-violet-600 shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm flex-1">{q}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="practice" className="mt-6">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Viva Examiner</CardTitle>
                  <p className="text-xs text-muted-foreground">Practice your oral examination</p>
                </div>
                <Badge variant="secondary" className="ml-auto">ML Fundamentals</Badge>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        : "bg-muted"
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your answer..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button variant="gradient" size="icon" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
