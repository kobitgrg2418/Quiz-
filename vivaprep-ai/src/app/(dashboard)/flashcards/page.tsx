"use client";

import Link from "next/link";
import { Layers, Play, Sparkles } from "lucide-react";

const flashcardSets = [
  { id: "1", title: "ML Core Concepts", doc: "Machine Learning Fundamentals", cards: 15, mastered: 10, time: "2 hours ago", tone: "purple" },
  { id: "2", title: "DSA Key Terms", doc: "Data Structures & Algorithms", cards: 20, mastered: 8, time: "1 day ago", tone: "blue" },
  { id: "3", title: "Chemistry Reactions", doc: "Organic Chemistry Chapter 5", cards: 12, mastered: 3, time: "3 days ago", tone: "cyan" },
  { id: "4", title: "OS Process States", doc: "Operating Systems — Ch.5", cards: 24, mastered: 18, time: "4 days ago", tone: "purple" },
  { id: "5", title: "TCP/IP Protocols", doc: "Computer Networks", cards: 32, mastered: 12, time: "1 week ago", tone: "cyan" },
  { id: "6", title: "DP Patterns", doc: "Algorithms — Dynamic Programming", cards: 16, mastered: 14, time: "1 week ago", tone: "blue" },
];

export default function FlashcardsPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
            Flashcards
          </h1>
          <p style={{ color: "var(--vp-text-2)", margin: "6px 0 0", fontSize: 14 }}>
            Study with AI-generated flashcards and spaced repetition
          </p>
        </div>
        <button className="vp-btn vp-btn-primary">
          <Sparkles size={14} /> Generate flashcards
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {flashcardSets.map((set) => {
          const pct = Math.round((set.mastered / set.cards) * 100);
          return (
            <Link
              key={set.id}
              href={`/flashcards/${set.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="vp-card" style={{
                padding: 20,
                cursor: "pointer",
                transition: "transform 0.15s var(--ease), box-shadow 0.15s var(--ease)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background:
                      set.tone === "purple" ? "linear-gradient(135deg, #7C3AED, #A855F7)" :
                      set.tone === "cyan" ? "linear-gradient(135deg, #06B6D4, #0EA5E9)" :
                                              "linear-gradient(135deg, #3B82F6, #6366F1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Layers size={20} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{set.title}</div>
                    <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{set.doc}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: "var(--vp-text-3)" }}>{set.mastered}/{set.cards} mastered</span>
                    <span style={{ fontFamily: "var(--font-mono-vp)", fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="vp-progress" style={{ height: 4 }}>
                    <div className="vp-progress-fill" style={{ width: pct + "%" }} />
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTop: "1px solid var(--vp-border)",
                }}>
                  <span style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{set.time}</span>
                  <span className="vp-btn vp-btn-soft vp-btn-sm" style={{ height: 28, fontSize: 12 }}>
                    <Play size={12} /> Study
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
