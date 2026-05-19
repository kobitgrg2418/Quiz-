"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Code,
  Users,
  Lightbulb,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface InterviewData {
  technical: { question: string; expectedAnswer: string }[];
  behavioral: { question: string; tip: string }[];
  scenario: { scenario: string; question: string }[];
}

interface DocumentOption {
  id: string;
  title: string;
  status: string;
}

export default function InterviewPage() {
  const [data, setData] = useState<InterviewData | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((json) => {
        const docs = Array.isArray(json) ? json : json.data || [];
        setDocuments(docs.filter((d: DocumentOption) => d.status === "READY"));
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedDoc) return;
    setGenerating(true);
    setDialogOpen(false);
    toast.info("Generating interview questions...");

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc }),
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
        toast.success("Interview questions generated!");
      } else {
        const result = await res.json();
        toast.error(result.error || "Failed to generate interview questions");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Preparation</h1>
          <p className="text-muted-foreground mt-1">
            Practice technical and behavioral interview questions
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
              <DialogTitle>Generate Interview Questions</DialogTitle>
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
            <p className="text-muted-foreground">Generating interview questions...</p>
          </CardContent>
        </Card>
      )}

      {!data && !generating && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No interview questions yet. Select a lecture and generate questions to get started.</p>
          </CardContent>
        </Card>
      )}

      {data && !generating && (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Technical", icon: Code, count: data.technical.length, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
              { label: "Behavioral", icon: Users, count: data.behavioral.length, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
              { label: "Scenario", icon: Lightbulb, count: data.scenario.length, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
            ].map((cat) => (
              <Card key={cat.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.bg}`}>
                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{cat.count}</div>
                    <div className="text-sm text-muted-foreground">{cat.label} Questions</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="technical">
            <TabsList>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="scenario">Scenario</TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="mt-6 space-y-3">
              {data.technical.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setExpandedQ(expandedQ === `t-${i}` ? null : `t-${i}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">Q{i + 1}</Badge>
                        <p className="text-sm font-medium flex-1">{q.question}</p>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedQ === `t-${i}` ? "rotate-90" : ""}`} />
                      </div>
                      {expandedQ === `t-${i}` && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border/50">
                          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                            <div className="text-xs font-medium text-emerald-600 mb-1">Key Points to Cover</div>
                            <p className="text-sm text-muted-foreground">{q.expectedAnswer}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="behavioral" className="mt-6 space-y-3">
              {data.behavioral.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setExpandedQ(expandedQ === `b-${i}` ? null : `b-${i}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">Q{i + 1}</Badge>
                        <p className="text-sm font-medium flex-1">{q.question}</p>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedQ === `b-${i}` ? "rotate-90" : ""}`} />
                      </div>
                      {expandedQ === `b-${i}` && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border/50">
                          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
                            <div className="text-xs font-medium text-amber-600 mb-1">Interview Tip</div>
                            <p className="text-sm text-muted-foreground">{q.tip}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="scenario" className="mt-6 space-y-3">
              {data.scenario.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mb-2">Scenario {i + 1}</Badge>
                      <p className="text-sm text-muted-foreground mb-2">{q.scenario}</p>
                      <p className="text-sm font-medium">{q.question}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
