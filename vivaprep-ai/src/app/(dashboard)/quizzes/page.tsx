"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Target,
  Trophy,
  Play,
  Sparkles,
  Loader2,
  FileText,
  X,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/format";

interface QuizData {
  id: string;
  title: string;
  mode: string;
  createdAt: string;
  document: { title: string };
  questions: { id: string }[];
  attempts: { score: number; totalPoints: number }[];
}

interface DocumentOption {
  id: string;
  title: string;
  status: string;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [mode, setMode] = useState("MEDIUM");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/quiz");
      if (res.ok) {
        const json = await res.json();
        setQuizzes(Array.isArray(json) ? json : json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const docs = await res.json();
        setDocuments(docs.filter((d: DocumentOption) => d.status === "READY"));
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const openGenerate = async () => {
    setShowGenerate(true);
    await fetchDocuments();
  };

  const handleGenerate = async () => {
    if (!selectedDoc) {
      toast.error("Please select a lecture");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc, mode, count }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate quiz");
      }
      const quiz = await res.json();
      toast.success("Quiz generated!");
      setShowGenerate(false);
      router.push(`/quizzes/${quiz.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    setMenuOpen(null);
    try {
      const res = await fetch(`/api/ai/quiz/${quizId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Quiz deleted");
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const handleRename = async () => {
    if (!renaming || !renaming.title.trim()) return;
    try {
      const res = await fetch(`/api/ai/quiz/${renaming.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renaming.title.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Quiz renamed");
      setQuizzes((prev) => prev.map((q) => q.id === renaming.id ? { ...q, title: renaming.title.trim() } : q));
      setRenaming(null);
    } catch {
      toast.error("Failed to rename quiz");
    }
  };

  const totalQuizzes = quizzes.length;
  const avgScore = quizzes.length > 0
    ? Math.round(
        quizzes.reduce((sum, q) => {
          const best = q.attempts[0];
          return sum + (best ? Math.round((best.score / Math.max(best.totalPoints, 1)) * 100) : 0);
        }, 0) / quizzes.length
      )
    : 0;

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
        <button className="vp-btn vp-btn-primary" onClick={openGenerate}>
          <Sparkles size={14} /> Generate new quiz
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Quizzes", value: String(totalQuizzes), icon: BrainCircuit, accent: "#7C3AED" },
          { label: "Average Score", value: `${avgScore}%`, icon: Target, accent: "#10B981" },
          { label: "Questions Bank", value: String(quizzes.reduce((s, q) => s + q.questions.length, 0)), icon: Trophy, accent: "#F59E0B" },
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
        </div>
        <div style={{ borderTop: "1px solid var(--vp-border)" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 40, color: "var(--vp-text-3)" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 14 }}>Loading quizzes...</span>
            </div>
          ) : quizzes.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--vp-text-3)" }}>
              <BrainCircuit size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No quizzes yet</div>
              <div style={{ fontSize: 13 }}>Generate a quiz from one of your lectures to get started</div>
            </div>
          ) : (
            quizzes.map((quiz, i, arr) => {
              const modeLabel = quiz.mode.toLowerCase();
              const bestAttempt = quiz.attempts[0];
              const bestScore = bestAttempt ? Math.round((bestAttempt.score / Math.max(bestAttempt.totalPoints, 1)) * 100) : null;

              return (
                <div
                  key={quiz.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--vp-border)" : "none",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/quizzes/${quiz.id}`)}
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
                        background: modeLabel === "easy" ? "rgba(16,185,129,0.15)" : modeLabel === "medium" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                        borderColor: modeLabel === "easy" ? "rgba(16,185,129,0.3)" : modeLabel === "medium" ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)",
                        color: modeLabel === "easy" ? "#10B981" : modeLabel === "medium" ? "#F59E0B" : "#EF4444",
                        textTransform: "capitalize",
                      }}>
                        {modeLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>
                      {quiz.document.title} · {quiz.questions.length} questions · {timeAgo(quiz.createdAt)}
                    </div>
                  </div>
                  {bestScore !== null && (
                    <div style={{ textAlign: "right", marginRight: 8 }}>
                      <div style={{ fontFamily: "var(--font-mono-vp)", fontSize: 16, fontWeight: 700 }}>{bestScore}%</div>
                      <div className="vp-progress" style={{ width: 80, height: 3, marginTop: 6 }}>
                        <div className="vp-progress-fill" style={{ width: bestScore + "%" }} />
                      </div>
                      <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginTop: 4 }}>{quiz.attempts.length} attempt{quiz.attempts.length !== 1 ? "s" : ""}</div>
                    </div>
                  )}
                  {/* Actions Menu */}
                  <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === quiz.id ? null : quiz.id)}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6,
                        color: "var(--vp-text-3)", display: "flex", alignItems: "center",
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === quiz.id && (
                      <>
                        <div
                          style={{ position: "fixed", inset: 0, zIndex: 40 }}
                          onClick={() => setMenuOpen(null)}
                        />
                        <div
                          style={{
                            position: "absolute", bottom: "100%", right: 0, zIndex: 50, minWidth: 150,
                            marginBottom: 4,
                            background: "var(--vp-surface-solid)", border: "1px solid var(--vp-border)",
                            borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", overflow: "hidden",
                          }}
                        >
                          <button
                            onClick={() => { setMenuOpen(null); setRenaming({ id: quiz.id, title: quiz.title }); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px",
                              fontSize: 13, background: "none", border: "none", cursor: "pointer", color: "inherit", textAlign: "left",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "var(--vp-surface-hi)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <Pencil size={14} /> Rename
                          </button>
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px",
                              fontSize: 13, background: "none", border: "none", cursor: "pointer", color: "#EF4444", textAlign: "left",
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "var(--vp-surface-hi)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <span
                    className="vp-btn vp-btn-primary vp-btn-sm"
                    onClick={(e) => { e.stopPropagation(); router.push(`/quizzes/${quiz.id}`); }}
                  >
                    <Play size={12} /> Start
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      {renaming && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setRenaming(null); }}
        >
          <div style={{ background: "var(--vp-surface-solid)", border: "1px solid var(--vp-border)", borderRadius: 16, padding: 24, width: 400, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>Rename Quiz</h2>
            <input
              className="vp-input"
              value={renaming.title}
              onChange={(e) => setRenaming({ ...renaming, title: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
              autoFocus
              style={{ width: "100%", height: 40, fontSize: 14, marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="vp-btn vp-btn-ghost vp-btn-sm" onClick={() => setRenaming(null)}>Cancel</button>
              <button className="vp-btn vp-btn-primary vp-btn-sm" onClick={handleRename} disabled={!renaming.title.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Quiz Dialog */}
      {showGenerate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget && !generating) setShowGenerate(false); }}
        >
          <div style={{
            background: "var(--vp-surface-solid)",
            border: "1px solid var(--vp-border)",
            borderRadius: 16,
            padding: 24,
            width: 440,
            maxWidth: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Generate Quiz</h2>
                <p style={{ fontSize: 13, color: "var(--vp-text-3)", margin: "4px 0 0" }}>Create an AI-powered quiz from your lecture</p>
              </div>
              <button
                onClick={() => !generating && setShowGenerate(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vp-text-3)", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Lecture Selection */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Select Lecture</label>
                {documents.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--vp-text-3)", padding: "12px 0" }}>
                    No lectures available. Upload a PDF first.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: selectedDoc === doc.id ? "2px solid #7C3AED" : "1px solid var(--vp-border)",
                          background: selectedDoc === doc.id ? "color-mix(in srgb, #7C3AED 8%, transparent)" : "var(--vp-surface-hi)",
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 13,
                          fontWeight: selectedDoc === doc.id ? 600 : 400,
                          color: "inherit",
                          width: "100%",
                        }}
                      >
                        <FileText size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Difficulty</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { value: "EASY", label: "Easy", color: "#10B981" },
                    { value: "MEDIUM", label: "Medium", color: "#F59E0B" },
                    { value: "HARD", label: "Hard", color: "#EF4444" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setMode(d.value)}
                      className="chip"
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        height: 34,
                        fontSize: 13,
                        cursor: "pointer",
                        ...(mode === d.value ? {
                          background: `color-mix(in srgb, ${d.color} 15%, transparent)`,
                          borderColor: d.color,
                          color: d.color,
                          fontWeight: 600,
                        } : {}),
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Number of Questions: {count}
                </label>
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#7C3AED" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--vp-text-3)" }}>
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                className="vp-btn vp-btn-primary"
                onClick={handleGenerate}
                disabled={generating || !selectedDoc}
                style={{
                  width: "100%",
                  height: 42,
                  justifyContent: "center",
                  opacity: generating || !selectedDoc ? 0.6 : 1,
                  cursor: generating || !selectedDoc ? "not-allowed" : "pointer",
                }}
              >
                {generating ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    Generating quiz...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
