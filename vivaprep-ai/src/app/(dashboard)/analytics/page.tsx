"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Loader2,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AttemptData {
  id: string;
  score: number;
  totalPoints: number;
  timeTaken: number;
  quizTitle: string;
  completedAt: string | null;
  createdAt: string;
}

interface AnalyticsData {
  totalQuizzes: number;
  averageScore: number;
  totalFlashcards: number;
  totalStudyTime: number;
  totalNotes: number;
  totalDocuments: number;
  streak: number;
  recentAttempts: AttemptData[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const totalStudyMins = Math.round(data.totalStudyTime / 60);
  const totalTimeTaken = data.recentAttempts.reduce((sum, a) => sum + a.timeTaken, 0);

  // Build weekly chart from recent attempts (last 7 days)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toDateString();
    const dayAttempts = data.recentAttempts.filter(
      (a) => new Date(a.createdAt).toDateString() === dayStr
    );
    return {
      day: weekDays[date.getDay()],
      count: dayAttempts.length,
      avgScore:
        dayAttempts.length > 0
          ? Math.round(
              dayAttempts.reduce((s, a) => s + a.score, 0) / dayAttempts.length
            )
          : 0,
    };
  });
  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  const stats = [
    {
      label: "Total Quizzes",
      value: String(data.totalQuizzes),
      icon: BarChart3,
      color: "text-violet-600",
      bg: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      label: "Avg. Score",
      value: `${data.averageScore}%`,
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Study Time",
      value: formatDuration(totalTimeTaken || totalStudyMins * 60),
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Study Streak",
      value: `${data.streak} day${data.streak !== 1 ? "s" : ""}`,
      icon: Flame,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress and performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 7 Days Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {weeklyData.map((day, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  {day.count > 0 && (
                    <div className="text-xs font-medium">
                      {day.avgScore}%
                    </div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height:
                        day.count > 0
                          ? `${Math.max((day.count / maxCount) * 100, 8)}%`
                          : "4px",
                    }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`w-full rounded-t-lg min-h-[4px] ${
                      day.count > 0
                        ? "bg-gradient-to-t from-violet-600 to-indigo-500"
                        : "bg-muted"
                    }`}
                  />
                  <div className="text-xs text-muted-foreground">{day.day}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Documents", value: data.totalDocuments, max: Math.max(data.totalDocuments, 10) },
              { label: "Quizzes", value: data.totalQuizzes, max: Math.max(data.totalQuizzes, 10) },
              { label: "Flashcard Sets", value: data.totalFlashcards, max: Math.max(data.totalFlashcards, 10) },
              { label: "Notes", value: data.totalNotes, max: Math.max(data.totalNotes, 10) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <Progress
                  value={Math.round((item.value / item.max) * 100)}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Quiz Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Quiz Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No quiz attempts yet. Take a quiz to see your progress here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAttempts.map((attempt, i) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-2"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      attempt.score >= 80
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : attempt.score >= 50
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <Target
                      className={`h-4 w-4 ${
                        attempt.score >= 80
                          ? "text-emerald-600"
                          : attempt.score >= 50
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {attempt.quizTitle} — {attempt.score}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {timeAgo(attempt.createdAt)}
                      {attempt.timeTaken > 0 &&
                        ` · ${formatDuration(attempt.timeTaken)}`}
                    </div>
                  </div>
                  <Badge
                    variant={
                      attempt.score >= 80
                        ? "success"
                        : attempt.score >= 50
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {attempt.score >= 80
                      ? "Great"
                      : attempt.score >= 50
                      ? "OK"
                      : "Needs work"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
