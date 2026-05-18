"use client";

import Link from "next/link";
import {
  BrainCircuit,
  Target,
  Trophy,
  Play,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";

export default function QuizzesPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
            Quizzes
          </h1>
          <p style={{ color: "var(--vp-text-2)", margin: "6px 0 0", fontSize: 14 }}>
            Test your knowledge with AI-generated quizzes
          </p>
        </div>
        <button className="vp-btn vp-btn-primary">
          <Sparkles size={14} /> Generate new quiz
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Quizzes", value: "12", icon: BrainCircuit, accent: "#7C3AED" },
          { label: "Average Score", value: "82%", icon: Target, accent: "#10B981" },
          { label: "Best Streak", value: "7 days", icon: Trophy, accent: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className="vp-card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `color-mix(in srgb, ${stat.accent} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${stat.accent} 25%, transparent)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <stat.icon size={20} style={{ color: stat.accent }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz List */}
      <div className="vp-card" style={{ padding: 0 }}>
        <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Your quizzes
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Easy", "Medium", "Hard"].map((f, i) => (
              <button key={f} className="chip" style={i === 0 ? {
                background: "var(--grad)", color: "white", borderColor: "transparent",
              } : {}}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--vp-border)" }}>
          {[
            { id: "1", title: "ML Fundamentals Quiz", doc: "Machine Learning Fundamentals", mode: "medium", questions: 10, score: 85, attempts: 3, time: "2 hours ago" },
            { id: "2", title: "DSA Practice Test", doc: "Data Structures & Algorithms", mode: "hard", questions: 15, score: 72, attempts: 2, time: "1 day ago" },
            { id: "3", title: "Chemistry Quick Review", doc: "Organic Chemistry Chapter 5", mode: "easy", questions: 8, score: 90, attempts: 1, time: "3 days ago" },
            { id: "4", title: "OS Process Scheduling", doc: "Operating Systems — Ch.5", mode: "medium", questions: 12, score: 78, attempts: 4, time: "5 days ago" },
          ].map((quiz, i, arr) => (
            <Link
              key={quiz.id}
              href={`/quizzes/${quiz.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 20px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--vp-border)" : "none",
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.15s",
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <BrainCircuit size={20} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{quiz.title}</span>
                  <span className="chip" style={{
                    height: 20,
                    fontSize: 10,
                    background: quiz.mode === "easy" ? "rgba(16,185,129,0.15)" : quiz.mode === "medium" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                    borderColor: quiz.mode === "easy" ? "rgba(16,185,129,0.3)" : quiz.mode === "medium" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)",
                    color: quiz.mode === "easy" ? "#10B981" : quiz.mode === "medium" ? "#F59E0B" : "#EF4444",
                    textTransform: "capitalize",
                  }}>
                    {quiz.mode}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>
                  {quiz.doc} · {quiz.questions} questions · {quiz.time}
                </div>
              </div>
              <div style={{ textAlign: "right", marginRight: 8 }}>
                <div style={{ fontFamily: "var(--font-mono-vp)", fontSize: 16, fontWeight: 700 }}>{quiz.score}%</div>
                <div className="vp-progress" style={{ width: 80, height: 3, marginTop: 6 }}>
                  <div className="vp-progress-fill" style={{ width: quiz.score + "%" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginTop: 4 }}>{quiz.attempts} attempts</div>
              </div>
              <button className="vp-btn vp-btn-primary vp-btn-sm" onClick={(e) => e.preventDefault()}>
                <Play size={12} /> Start
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
