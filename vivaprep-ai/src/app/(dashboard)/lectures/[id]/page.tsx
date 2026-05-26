"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatFileSize, cleanDocumentTitle } from "@/lib/format";

interface DocumentDetail {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  status: string;
  createdAt: string;
  topics: { id: string; name: string }[];
  _count: { quizzes: number; flashcardSets: number };
}

const actions = [
  { id: "quiz", label: "Generate Quiz", icon: BrainCircuit, desc: "Create AI-powered quiz questions", color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30", href: "/quizzes" },
  { id: "flashcards", label: "Create Flashcards", icon: Layers, desc: "Auto-generate study flashcards", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", href: "/flashcards" },
  { id: "summary:CONCISE", label: "Concise Notes", icon: StickyNote, desc: "Brief bullet points & key facts", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", href: "/notes" },
  { id: "summary:DETAILED", label: "Detailed Notes", icon: StickyNote, desc: "Comprehensive coverage with context", color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30", href: "/notes" },
  { id: "summary:EXAM", label: "Exam Notes", icon: StickyNote, desc: "Focus on testable content & exam topics", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", href: "/notes" },
  { id: "summary:PRESENTATION", label: "Presentation Notes", icon: StickyNote, desc: "Talking points & slide-by-slide breakdown", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", href: "/notes" },
  { id: "viva", label: "Viva Questions", icon: GraduationCap, desc: "Generate viva exam questions", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", href: "/viva" },
  { id: "interview", label: "Interview Prep", icon: Briefcase, desc: "Create interview questions", color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30", href: "/interview" },
  { id: "chat", label: "Chat with PDF", icon: MessageSquare, desc: "Ask questions about content", color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30", href: null },
];

export default function LectureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (res.ok) {
          setDoc(await res.json());
        }
      } catch {}
      setLoading(false);
    }
    fetchDoc();
  }, [id]);

  const handleGenerate = async (actionId: string) => {
    if (actionId === "chat") {
      router.push(`/chat/${id}`);
      return;
    }

    setGenerating(actionId);

    let apiType = actionId;
    let mode: string | undefined;

    if (actionId.startsWith("summary:")) {
      apiType = "summary";
      mode = actionId.split(":")[1];
    }

    toast.info(`Generating ${apiType}...`);

    try {
      const body: Record<string, string> = { documentId: id };
      if (mode) body.mode = mode;

      const res = await fetch(`/api/ai/${apiType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Generated successfully!`);
        const action = actions.find((a) => a.id === actionId);
        if (apiType === "quiz" && data.id) router.push(`/quizzes/${data.id}`);
        else if (apiType === "flashcards" && data.id) router.push(`/flashcards/${data.id}`);
        else if (action?.href) router.push(action.href);
      } else {
        const data = await res.json();
        toast.error(data.error || `Failed to generate ${apiType}`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lecture and all its quizzes, flashcards, and notes?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lecture deleted");
        router.push("/lectures");
      } else {
        toast.error("Failed to delete lecture");
      }
    } catch {
      toast.error("Failed to delete lecture");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center max-w-md w-full p-8">
          <p className="text-muted-foreground mb-4">Lecture not found</p>
          <Link href="/lectures"><Button variant="gradient">Back to Lectures</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/lectures">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{cleanDocumentTitle(doc.title)}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={doc.status === "READY" ? "success" : doc.status === "FAILED" ? "destructive" : "secondary"}>
              {doc.status.toLowerCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {doc.pageCount > 0 && `${doc.pageCount} ${doc.pageCount === 1 ? "page" : "pages"} · `}{formatFileSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </div>

      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Content</TabsTrigger>
          <TabsTrigger value="content">Document Info</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          {doc.status !== "READY" ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {doc.status === "PROCESSING" ? "Document is still processing. Please wait..." : "Document processing failed. Try re-uploading."}
              </CardContent>
            </Card>
          ) : (
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
                    onClick={() => handleGenerate(action.id)}
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
          )}
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">File:</span> <span className="font-medium">{doc.fileName}</span></div>
                <div><span className="text-muted-foreground">Size:</span> <span className="font-medium">{formatFileSize(doc.fileSize)}</span></div>
                <div><span className="text-muted-foreground">Pages:</span> <span className="font-medium">{doc.pageCount}</span></div>
                <div><span className="text-muted-foreground">Quizzes:</span> <span className="font-medium">{doc._count.quizzes}</span></div>
                <div><span className="text-muted-foreground">Flashcard Sets:</span> <span className="font-medium">{doc._count.flashcardSets}</span></div>
                <div><span className="text-muted-foreground">Uploaded:</span> <span className="font-medium">{new Date(doc.createdAt).toLocaleString()}</span></div>
              </div>
              {doc.topics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {doc.topics.map((topic) => (
                      <Badge key={topic.id} variant="secondary" className="px-3 py-1">{topic.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
