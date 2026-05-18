"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Trophy,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const weeklyData = [
  { day: "Mon", quizzes: 3, score: 82 },
  { day: "Tue", quizzes: 5, score: 78 },
  { day: "Wed", quizzes: 2, score: 90 },
  { day: "Thu", quizzes: 4, score: 85 },
  { day: "Fri", quizzes: 6, score: 88 },
  { day: "Sat", quizzes: 1, score: 95 },
  { day: "Sun", quizzes: 3, score: 87 },
];

const topicMastery = [
  { topic: "Machine Learning", mastery: 85 },
  { topic: "Data Structures", mastery: 72 },
  { topic: "Neural Networks", mastery: 68 },
  { topic: "Algorithms", mastery: 90 },
  { topic: "Chemistry", mastery: 55 },
];

const recentActivity = [
  { type: "Quiz", title: "ML Fundamentals Quiz - 92%", time: "2 hours ago", icon: Target },
  { type: "Flashcards", title: "Reviewed 15 DSA cards", time: "5 hours ago", icon: Trophy },
  { type: "Viva", title: "Practiced 10 viva questions", time: "1 day ago", icon: Flame },
  { type: "Quiz", title: "Chemistry Quick Review - 88%", time: "2 days ago", icon: Target },
];

export default function AnalyticsPage() {
  const maxQuizzes = Math.max(...weeklyData.map((d) => d.quizzes));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress and performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Quizzes", value: "47", icon: BarChart3, change: "+12%", color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
          { label: "Avg. Score", value: "84%", icon: Target, change: "+5%", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "Study Hours", value: "23h", icon: Clock, change: "+3h", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "Study Streak", value: "7 days", icon: Flame, change: "Best!", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge variant="success" className="text-xs">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Quiz Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {weeklyData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium">{day.score}%</div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.quizzes / maxQuizzes) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500 min-h-[8px]"
                  />
                  <div className="text-xs text-muted-foreground">{day.day}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topic Mastery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicMastery.map((topic) => (
              <div key={topic.topic}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-muted-foreground">{topic.mastery}%</span>
                </div>
                <Progress value={topic.mastery} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <activity.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.title}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
                <Badge variant="secondary" className="text-xs">{activity.type}</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
