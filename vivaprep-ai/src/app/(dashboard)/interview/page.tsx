"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Code, Users, Lightbulb, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const interviewQuestions = {
  technical: [
    { question: "Explain the difference between L1 and L2 regularization.", expected: "L1 adds absolute value penalty (sparsity), L2 adds squared penalty (weight decay). L1 can zero out features, useful for feature selection." },
    { question: "How would you handle class imbalance in a classification problem?", expected: "Oversampling (SMOTE), undersampling, class weights, different metrics (F1, AUC-ROC), ensemble methods." },
    { question: "What is the vanishing gradient problem and how do you address it?", expected: "Gradients become very small in deep networks. Solutions: ReLU activation, batch normalization, residual connections, LSTM/GRU." },
  ],
  behavioral: [
    { question: "Tell me about a time you disagreed with a team decision.", tip: "Use STAR method. Show respectful disagreement, data-driven argument, and willingness to commit to the final decision." },
    { question: "Describe a challenging project you led.", tip: "Focus on the complexity, your leadership actions, obstacles overcome, and measurable outcomes." },
    { question: "How do you handle tight deadlines with competing priorities?", tip: "Show prioritization framework, communication with stakeholders, and pragmatic trade-off decisions." },
  ],
  scenario: [
    { scenario: "Your ML model's accuracy dropped 15% after a new data pipeline was deployed.", question: "Walk me through your debugging approach." },
    { scenario: "A client wants a model deployed in 2 weeks but the data quality is poor.", question: "How would you manage expectations and deliver value?" },
    { scenario: "Your team disagrees on whether to use a simple model vs. deep learning approach.", question: "How do you facilitate this technical decision?" },
  ],
};

export default function InterviewPage() {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Interview Preparation</h1>
        <p className="text-muted-foreground mt-1">Practice technical and behavioral interview questions</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Technical", icon: Code, count: interviewQuestions.technical.length, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Behavioral", icon: Users, count: interviewQuestions.behavioral.length, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "Scenario", icon: Lightbulb, count: interviewQuestions.scenario.length, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
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
          {interviewQuestions.technical.map((q, i) => (
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
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-border/50"
                    >
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                        <div className="text-xs font-medium text-emerald-600 mb-1">Key Points to Cover</div>
                        <p className="text-sm text-muted-foreground">{q.expected}</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="behavioral" className="mt-6 space-y-3">
          {interviewQuestions.behavioral.map((q, i) => (
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
          {interviewQuestions.scenario.map((q, i) => (
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
    </div>
  );
}
