"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ChevronRight,
  Loader2,
  Send,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface VivaQuestions {
  basic: string[];
  conceptual: string[];
  followUp: string[];
  deep: string[];
}

interface DocumentOption {
  id: string;
  title: string;
  status: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function VivaPage() {
  const [questions, setQuestions] = useState<VivaQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("basic");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((docs) => setDocuments(docs.filter((d: DocumentOption) => d.status === "READY")))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    setGenerating(true);
    setDialogOpen(false);
    toast.info("Generating viva questions...");

    try {
      const res = await fetch("/api/ai/viva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setMessages([
          {
            role: "assistant",
            content:
              "Welcome to your Viva practice session. I'll be your examiner today. Let's begin — answer the questions from the question bank, and I'll help you refine your understanding.",
          },
        ]);
        toast.success("Viva questions generated!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to generate viva questions");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const docId = selectedDoc;
      if (!docId) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Please generate viva questions first by selecting a document." },
        ]);
        setChatLoading(false);
        return;
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          message: `You are a viva examiner. The student said: "${userMsg}". Evaluate their answer, point out what was good and what could be improved, then ask a follow-up question to probe deeper.`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response || data.content || "I couldn't generate a response." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const categories = ["basic", "conceptual", "followUp", "deep"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Viva Preparation</h1>
          <p className="text-muted-foreground mt-1">
            Practice for oral examinations with AI-generated questions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" /> Generate Questions
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Viva Questions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lecture" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="gradient"
                className="w-full"
                onClick={handleGenerate}
                disabled={!selectedDoc}
              >
                Generate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {generating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Generating viva questions...</p>
          </CardContent>
        </Card>
      )}

      {!questions && !generating && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No viva questions yet. Select a lecture and generate questions to get started.</p>
          </CardContent>
        </Card>
      )}

      {questions && !generating && (
        <Tabs defaultValue="questions">
          <TabsList>
            <TabsTrigger value="questions">Question Bank</TabsTrigger>
            <TabsTrigger value="practice">Practice Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="capitalize"
                >
                  {cat === "followUp" ? "Follow-up" : cat}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {(questions[activeCategory as keyof VivaQuestions] || []).map(
                (q, i) => (
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
                )
              )}
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
                    <p className="text-xs text-muted-foreground">
                      Practice your oral examination
                    </p>
                  </div>
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
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your answer..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={chatLoading}
                  />
                  <Button
                    variant="gradient"
                    size="icon"
                    onClick={handleSend}
                    disabled={chatLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
