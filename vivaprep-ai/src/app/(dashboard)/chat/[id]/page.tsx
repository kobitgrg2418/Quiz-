"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Sparkles, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cleanDocumentTitle } from "@/lib/format";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Summarize the key concepts",
  "Generate viva questions from this",
  "What are the most important points?",
  "Explain this topic simply",
];

export default function ChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch document title
  useEffect(() => {
    async function loadDocTitle() {
      try {
        const res = await fetch(`/api/documents/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setDocTitle(cleanDocumentTitle(data.title || "Document"));
        }
      } catch {}
    }
    loadDocTitle();
  }, [params.id]);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/ai/chat?documentId=${params.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
          } else {
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content:
                  "Hi! I've analyzed your document. Ask me anything about the content - I can explain concepts, generate questions, create summaries, or help you prepare for exams.",
              },
            ]);
          }
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content:
                "Hi! I've analyzed your document. Ask me anything about the content.",
            },
          ]);
        }
      } catch {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hi! Ask me anything about this document.",
          },
        ]);
      } finally {
        setHistoryLoaded(true);
      }
    }
    loadHistory();
  }, [params.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: params.id, message }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I couldn't process that request. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please check your network and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 pb-4 border-b border-border/50">
        <Link href="/lectures">
          <Button variant="ghost" size="icon" className="rounded-xl shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shrink-0">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold truncate text-sm sm:text-base">{docTitle || "Chat with Document"}</h2>
          <p className="text-xs text-muted-foreground hidden sm:block">Ask questions about your lecture content</p>
        </div>
        <Badge variant="secondary" className="ml-auto shrink-0 hidden sm:inline-flex">AI Powered</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={msg.role === "assistant" ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs" : "text-xs"}>
                  {msg.role === "assistant" ? "AI" : "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-2xl px-4 py-3 text-sm max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestions.map((s) => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => handleSend(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Ask about your lecture..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
            className="flex-1"
          />
          <Button
            variant="gradient"
            size="icon"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
