"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FileText,
  BrainCircuit,
  Layers,
  Upload,
  ArrowRight,
  Loader2,
  StickyNote,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";

interface DashboardStats {
  documents: number;
  quizzes: number;
  flashcardSets: number;
  notes: number;
}

interface RecentDoc {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count: { quizzes: number; flashcardSets: number };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({ documents: 0, quizzes: 0, flashcardSets: 0, notes: 0 });
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    async function load() {
      try {
        const [docsRes, quizzesRes, flashcardsRes, notesRes] = await Promise.all([
          fetch("/api/documents"),
          fetch("/api/ai/quiz"),
          fetch("/api/ai/flashcards"),
          fetch("/api/notes"),
        ]);

        const docs = docsRes.ok ? await docsRes.json() : [];
        const quizzes = quizzesRes.ok ? await quizzesRes.json() : [];
        const flashcards = flashcardsRes.ok ? await flashcardsRes.json() : [];
        const notes = notesRes.ok ? await notesRes.json() : [];

        setStats({
          documents: docs.length,
          quizzes: quizzes.length,
          flashcardSets: flashcards.length,
          notes: notes.length,
        });
        setRecentDocs(docs.slice(0, 5));
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    { label: "Lectures", value: stats.documents, icon: FileText, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", href: "/lectures" },
    { label: "Quizzes", value: stats.quizzes, icon: BrainCircuit, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30", href: "/quizzes" },
    { label: "Flashcard Sets", value: stats.flashcardSets, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", href: "/flashcards" },
    { label: "Notes", value: stats.notes, icon: StickyNote, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", href: "/notes" },
  ];

  const quickActions = [
    { label: "Upload Lecture", icon: Upload, href: "/lectures", desc: "Upload a PDF to get started" },
    { label: "Generate Quiz", icon: BrainCircuit, href: "/quizzes", desc: "Create quiz from your lectures" },
    { label: "Create Flashcards", icon: Layers, href: "/flashcards", desc: "Auto-generate study flashcards" },
    { label: "Key Points", icon: StickyNote, href: "/lectures", desc: "Extract important concepts" },
    { label: "Viva Prep", icon: GraduationCap, href: "/viva", desc: "Practice oral exam questions" },
    { label: "Interview Prep", icon: Briefcase, href: "/interview", desc: "Prepare for interviews" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your study overview.
          </p>
        </div>
        <Link href="/lectures">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" /> Upload PDF
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Lectures</h2>
            <Link href="/lectures">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No lectures yet. Upload a PDF to get started.</p>
                <Link href="/lectures">
                  <Button variant="gradient" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" /> Upload PDF
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/lectures/${doc.id}`}>
                    <Card className="hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 shrink-0">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{doc.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={doc.status === "READY" ? "success" : doc.status === "FAILED" ? "destructive" : "secondary"} className="text-xs">
                              {doc.status.toLowerCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {doc._count.quizzes} quizzes · {doc._count.flashcardSets} flashcard sets
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={action.href}>
                  <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="p-4">
                      <action.icon className="h-5 w-5 text-violet-600 mb-2" />
                      <h3 className="font-semibold text-sm">{action.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
