"use client";

import Link from "next/link";
import {
  FileText,
  BrainCircuit,
  Layers,
  Upload,
  ArrowRight,
  Sparkles,
  Cpu,
  Globe,
  Zap,
  Flame,
  Target,
  Brain,
  ChevronRight,
  Plus,
  Play,
  Mic,
  StickyNote,
  MessageSquare,
} from "lucide-react";
import { Sparkline } from "@/components/ui/sparkline";
import { AIOrb } from "@/components/ui/ai-orb";

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: 0,
          }}>
            Good afternoon.
          </h1>
          <p style={{ color: "var(--vp-text-2)", margin: "6px 0 0", fontSize: 14 }}>
            You have <strong style={{ color: "var(--vp-text)" }}>3 quizzes due today</strong> and{" "}
            <strong style={{ color: "var(--vp-text)" }}>1 viva scheduled</strong>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/lectures" className="vp-btn vp-btn-ghost" style={{ textDecoration: "none" }}>
            <Upload size={14} /> Upload PDF
          </Link>
          <Link href="/quizzes" className="vp-btn vp-btn-primary" style={{ textDecoration: "none" }}>
            <Sparkles size={14} /> Resume study
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { label: "Mastery score", value: "84", delta: "+6", unit: "%", icon: Target, trend: [60,62,68,65,72,78,84] },
          { label: "Study streak", value: "27", delta: "+1", unit: " days", icon: Flame, trend: [10,15,18,20,22,25,27] },
          { label: "Questions answered", value: "1,284", delta: "+147", icon: BrainCircuit, trend: [800,900,950,1050,1100,1180,1284] },
          { label: "Concepts learned", value: "342", delta: "+23", icon: Brain, trend: [200,230,270,290,310,325,342] },
        ].map((kpi) => (
          <div key={kpi.label} className="vp-card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--vp-text-2)", fontWeight: 500 }}>
                <kpi.icon size={14} style={{ color: "var(--vp-text-3)" }} />
                {kpi.label}
              </div>
              <div style={{
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 6,
                background: "rgba(16,185,129,0.12)",
                color: "#10B981",
                fontWeight: 600,
              }}>
                {kpi.delta}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>
                {kpi.value}
              </span>
              {kpi.unit && <span style={{ color: "var(--vp-text-3)", fontSize: 13 }}>{kpi.unit}</span>}
            </div>
            <Sparkline data={kpi.trend} width={220} height={28} />
          </div>
        ))}
      </div>

      {/* Main grid: Continue learning + Due today */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Continue Learning */}
        <div className="vp-card" style={{ padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
                Continue where you left off
              </div>
              <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 2 }}>
                3 active study sets · last opened 12m ago
              </div>
            </div>
            <Link href="/lectures" className="vp-btn vp-btn-soft vp-btn-sm" style={{ textDecoration: "none" }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ borderTop: "1px solid var(--vp-border)" }}>
            {[
              { title: "Operating Systems — Chapter 5", sub: "Process Scheduling · 47 concepts", progress: 68, due: "3 quizzes due", icon: Cpu, tone: "purple" },
              { title: "Computer Networks — TCP/IP Deep Dive", sub: "Transport layer · 32 concepts", progress: 42, due: "Viva in 2h", icon: Globe, tone: "cyan" },
              { title: "Algorithms — Dynamic Programming", sub: "Optimal substructure · 28 concepts", progress: 91, due: "Review tomorrow", icon: Zap, tone: "blue" },
            ].map((item, i, arr) => (
              <Link
                key={item.title}
                href="/quizzes"
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
                  borderRadius: 10,
                  background: item.tone === "purple" ? "linear-gradient(135deg, #7C3AED, #A855F7)" :
                              item.tone === "cyan" ? "linear-gradient(135deg, #06B6D4, #0EA5E9)" :
                                                      "linear-gradient(135deg, #3B82F6, #6366F1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <item.icon size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{item.sub}</div>
                  <div className="vp-progress" style={{ marginTop: 10, height: 4 }}>
                    <div className="vp-progress-fill" style={{ width: item.progress + "%" }} />
                  </div>
                </div>
                <div style={{ minWidth: 90, textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono-vp)", fontSize: 13, fontWeight: 600 }}>{item.progress}%</div>
                  <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginTop: 2 }}>{item.due}</div>
                </div>
                <ChevronRight size={16} style={{ color: "var(--vp-text-3)" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Due Today */}
        <div className="vp-card" style={{ padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
                Due today
              </div>
              <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 2 }}>
                4 sessions · est. 1h 40m
              </div>
            </div>
            <button className="vp-btn vp-btn-ghost vp-btn-icon vp-btn-sm">
              <Plus size={14} />
            </button>
          </div>
          <div style={{ borderTop: "1px solid var(--vp-border)" }}>
            {[
              { time: "14:30", title: "Process Scheduling", kind: "Quiz · 12 Q", icon: BrainCircuit, accent: "#7C3AED" },
              { time: "16:00", title: "TCP Congestion Control", kind: "Viva · 8 Q", icon: Mic, accent: "#06B6D4" },
              { time: "19:00", title: "DP — Knapsack", kind: "Flashcards · 24", icon: Layers, accent: "#3B82F6" },
              { time: "Late", title: "Memory Management", kind: "Notes review", icon: StickyNote, accent: "#A855F7" },
            ].map((item, i, arr) => (
              <div key={item.title} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--vp-border)" : "none",
              }}>
                <div style={{ fontFamily: "var(--font-mono-vp)", fontSize: 12, color: "var(--vp-text-2)", width: 40 }}>
                  {item.time}
                </div>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `color-mix(in srgb, ${item.accent} 18%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${item.accent} 30%, transparent)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <item.icon size={13} style={{ color: item.accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginTop: 1 }}>{item.kind}</div>
                </div>
                <button className="vp-btn vp-btn-ghost vp-btn-icon vp-btn-sm">
                  <Play size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Mastery + AI Recommendation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Mastery by Topic */}
        <div className="vp-card">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Mastery by topic
          </div>
          <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginBottom: 16 }}>Last 7 days</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "Process Scheduling", v: 92, c: "#10B981" },
              { name: "Memory Management", v: 78, c: "#06B6D4" },
              { name: "File Systems", v: 64, c: "#3B82F6" },
              { name: "TCP / IP", v: 51, c: "#A855F7" },
              { name: "Concurrency & Locking", v: 38, c: "#EC4899" },
              { name: "Distributed Systems", v: 22, c: "#F59E0B" },
            ].map((t, i) => (
              <div key={t.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--vp-text-2)" }}>{t.name}</span>
                  <span style={{ fontFamily: "var(--font-mono-vp)", fontWeight: 600 }}>{t.v}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: "var(--vp-surface-hi)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: t.v + "%",
                    background: t.c,
                    borderRadius: 4,
                    transition: "width 0.8s var(--ease)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Heatmap placeholder */}
        <div className="vp-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>Study heatmap</div>
              <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginTop: 2 }}>84 sessions in 12 weeks</div>
            </div>
            <span className="chip chip-grad">
              <Flame size={12} /> 27-day streak
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
            {Array.from({ length: 12 }).map((_, w) => (
              <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {Array.from({ length: 7 }).map((_, d) => {
                  const seed = (w * 7 + d) * 1.3;
                  const v = Math.max(0, Math.min(4, Math.round(Math.sin(seed) * 2 + 2 + w / 6)));
                  const colors = ["var(--vp-surface-hi)", "rgba(124,58,237,0.25)", "rgba(124,58,237,0.5)", "rgba(124,58,237,0.75)", "rgba(124,58,237,1)"];
                  return (
                    <div key={d} style={{
                      aspectRatio: "1",
                      background: colors[v],
                      borderRadius: 3,
                      border: "1px solid var(--vp-border)",
                    }} />
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, color: "var(--vp-text-3)" }}>
            <span>12 weeks ago</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>Less</span>
              {["var(--vp-surface-hi)", "rgba(124,58,237,0.25)", "rgba(124,58,237,0.5)", "rgba(124,58,237,0.75)", "rgba(124,58,237,1)"].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, background: c, borderRadius: 2, border: "1px solid var(--vp-border)" }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="vp-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 100% 0%, rgba(124,58,237,0.3), transparent 50%)",
            pointerEvents: "none",
          }} />
          <div style={{ padding: 20, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <AIOrb size={20} />
              <span style={{ fontSize: 11, color: "var(--vp-text-2)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                AI study plan
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 8 }}>
              You&apos;re weakest on <span className="grad-text">TCP congestion control</span>.
            </div>
            <div style={{ fontSize: 13, color: "var(--vp-text-2)", lineHeight: 1.5, marginBottom: 16 }}>
              Based on yesterday&apos;s quiz (51% accuracy), I&apos;ve generated a 25-minute focused review.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {["7 weakest concepts", "12 spaced-repetition flashcards", "3-question follow-up quiz"].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--vp-text-2)" }}>
                  <span style={{ color: "var(--grad-1)" }}>✓</span>
                  {s}
                </div>
              ))}
            </div>
            <Link
              href="/quizzes"
              className="vp-btn vp-btn-primary vp-btn-sm"
              style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
            >
              Start AI session <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="vp-card" style={{ padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Recent activity
          </div>
          <button className="vp-btn vp-btn-soft vp-btn-sm">View all</button>
        </div>
        <div style={{ borderTop: "1px solid var(--vp-border)", padding: "8px 0" }}>
          {[
            { t: "12m ago", a: "Generated quiz from", s: "OS — Chapter 5.pdf", icon: Sparkles },
            { t: "34m ago", a: "Completed flashcard review", s: "DP — 24 cards · 91% accuracy", icon: Layers },
            { t: "1h ago", a: "Asked AI", s: '"Why does RR have higher overhead than SJF?"', icon: MessageSquare },
            { t: "2h ago", a: "Uploaded", s: "TCP-IP Deep Dive.pdf · 84 pages", icon: Upload },
            { t: "Yesterday", a: "Finished mock viva", s: "Memory Management · score 78/100", icon: Mic },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px" }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--vp-surface-hi)",
                border: "1px solid var(--vp-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <item.icon size={13} style={{ color: "var(--vp-text-2)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "var(--vp-text-2)" }}>{item.a}</span>{" "}
                  <span style={{ fontWeight: 500 }}>{item.s}</span>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono-vp)", fontSize: 11, color: "var(--vp-text-3)" }}>{item.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
