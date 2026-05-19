"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StickyNote, FileText, Loader2, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface NoteItem {
  id: string;
  title: string;
  content: string;
  mode: string;
  createdAt: string;
  document: { title: string };
}

interface DocumentOption {
  id: string;
  title: string;
  status: string;
}

const modeColors: Record<string, string> = {
  CONCISE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DETAILED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  EXAM: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PRESENTATION: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const modeOptions = [
  { value: "CONCISE", label: "Concise", desc: "Brief bullet points, key facts only" },
  { value: "DETAILED", label: "Detailed", desc: "Comprehensive coverage with context" },
  { value: "EXAM", label: "Exam Focus", desc: "Likely exam topics and testable content" },
  { value: "PRESENTATION", label: "Presentation", desc: "Talking points and slide breakdown" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [selectedMode, setSelectedMode] = useState("CONCISE");
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const json = await res.json();
        setNotes(Array.isArray(json) ? json : json.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    async function load() {
      await fetchNotes();
      setLoading(false);
    }
    load();

    fetch("/api/documents")
      .then((r) => r.json())
      .then((docs) => setDocuments(docs.filter((d: DocumentOption) => d.status === "READY")))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    setGenerating(true);
    setDialogOpen(false);
    toast.info("Generating notes...");

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc, mode: selectedMode }),
      });

      if (res.ok) {
        toast.success("Notes generated successfully!");
        await fetchNotes();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to generate notes");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        toast.success("Note deleted");
      } else {
        toast.error("Failed to delete note");
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes & Summaries</h1>
          <p className="text-muted-foreground mt-1">AI-generated study notes from your lectures</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" /> Generate Notes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Lecture</label>
                <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lecture" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Note Style</label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modeOptions.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div>
                          <div>{mode.label}</div>
                          <div className="text-xs text-muted-foreground">{mode.desc}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <p className="text-muted-foreground">Generating notes... This may take a moment.</p>
          </CardContent>
        </Card>
      )}

      {notes.length === 0 && !generating ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <StickyNote className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No notes yet. Click &quot;Generate Notes&quot; to create summaries from your lectures.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                      <StickyNote className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{note.document.title}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 shrink-0"
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Badge className={`mt-3 ${modeColors[note.mode] || ""}`}>{note.mode}</Badge>
                  {expandedId === note.id ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-border/50"
                    >
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{note.content}</p>
                    </motion.div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3 whitespace-pre-line">
                      {note.content.slice(0, 200)}{note.content.length > 200 ? "..." : ""}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
