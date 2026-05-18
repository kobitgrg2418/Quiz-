"use client";

import { motion } from "framer-motion";
import { StickyNote, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notes = [
  { id: "1", title: "ML Key Points - Concise", document: "Machine Learning Fundamentals", mode: "CONCISE", excerpt: "Key concepts: supervised/unsupervised learning, gradient descent, neural networks, overfitting prevention...", updatedAt: "2 hours ago" },
  { id: "2", title: "DSA Exam Notes", document: "Data Structures & Algorithms", mode: "EXAM", excerpt: "Important topics: time complexity analysis, tree traversal algorithms, graph shortest paths, dynamic programming...", updatedAt: "1 day ago" },
  { id: "3", title: "Chemistry Presentation Notes", document: "Organic Chemistry Chapter 5", mode: "PRESENTATION", excerpt: "Talking points: reaction mechanisms overview, nucleophilic substitution, elimination reactions...", updatedAt: "3 days ago" },
];

const modeColors: Record<string, string> = {
  CONCISE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DETAILED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  EXAM: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PRESENTATION: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notes & Summaries</h1>
        <p className="text-muted-foreground mt-1">AI-generated study notes from your lectures</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                    <StickyNote className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{note.document}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`mt-3 ${modeColors[note.mode]}`}>{note.mode}</Badge>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{note.excerpt}</p>
                <div className="mt-4 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{note.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
