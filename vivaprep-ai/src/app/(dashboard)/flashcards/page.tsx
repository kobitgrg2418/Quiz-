"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Play, Sparkles, Loader2, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface FlashcardSetData {
  id: string;
  title: string;
  createdAt: string;
  document: { title: string };
  flashcards: { id: string }[];
}

interface DocumentOption {
  id: string;
  title: string;
  status: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [sets, setSets] = useState<FlashcardSetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [count, setCount] = useState(15);
  const [generating, setGenerating] = useState(false);

  const fetchSets = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/flashcards");
      if (res.ok) setSets(await res.json());
    } catch (err) {
      console.error("Failed to fetch flashcard sets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  const openGenerate = async () => {
    setShowGenerate(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const docs = await res.json();
        setDocuments(docs.filter((d: DocumentOption) => d.status === "READY"));
      }
    } catch {}
  };

  const handleGenerate = async () => {
    if (!selectedDoc) { toast.error("Please select a lecture"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDoc, count }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate flashcards");
      }
      const set = await res.json();
      toast.success("Flashcards generated!");
      setShowGenerate(false);
      router.push(`/flashcards/${set.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const tones = ["purple", "blue", "cyan"];

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
        <button className="vp-btn vp-btn-primary" onClick={openGenerate}>
          <Sparkles size={14} /> Generate flashcards
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 60, color: "var(--vp-text-3)" }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 14 }}>Loading flashcards...</span>
        </div>
      ) : sets.length === 0 ? (
        <div className="vp-card" style={{ padding: 60, textAlign: "center", color: "var(--vp-text-3)" }}>
          <Layers size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>No flashcard sets yet</div>
          <div style={{ fontSize: 13 }}>Generate flashcards from one of your lectures to get started</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {sets.map((set, idx) => {
            const tone = tones[idx % tones.length];
            const cardCount = set.flashcards.length;
            return (
              <Link key={set.id} href={`/flashcards/${set.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="vp-card" style={{ padding: 20, cursor: "pointer", transition: "transform 0.15s var(--ease), box-shadow 0.15s var(--ease)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: tone === "purple" ? "linear-gradient(135deg, #7C3AED, #A855F7)" :
                        tone === "cyan" ? "linear-gradient(135deg, #06B6D4, #0EA5E9)" :
                          "linear-gradient(135deg, #3B82F6, #6366F1)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Layers size={20} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{set.title}</div>
                      <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{set.document.title}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16, fontSize: 13, color: "var(--vp-text-3)" }}>
                    {cardCount} cards
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: 12, borderTop: "1px solid var(--vp-border)",
                  }}>
                    <span style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{timeAgo(set.createdAt)}</span>
                    <span className="vp-btn vp-btn-soft vp-btn-sm" style={{ height: 28, fontSize: 12 }}>
                      <Play size={12} /> Study
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Generate Dialog */}
      {showGenerate && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !generating) setShowGenerate(false); }}
        >
          <div style={{ background: "var(--vp-surface)", border: "1px solid var(--vp-border)", borderRadius: 16, padding: 24, width: 440, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Generate Flashcards</h2>
                <p style={{ fontSize: 13, color: "var(--vp-text-3)", margin: "4px 0 0" }}>Create AI-powered flashcards from your lecture</p>
              </div>
              <button onClick={() => !generating && setShowGenerate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--vp-text-3)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Select Lecture</label>
                {documents.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--vp-text-3)", padding: "12px 0" }}>No lectures available. Upload a PDF first.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                    {documents.map((doc) => (
                      <button key={doc.id} onClick={() => setSelectedDoc(doc.id)} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                        border: selectedDoc === doc.id ? "2px solid #7C3AED" : "1px solid var(--vp-border)",
                        background: selectedDoc === doc.id ? "color-mix(in srgb, #7C3AED 8%, transparent)" : "var(--vp-surface-hi)",
                        cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: selectedDoc === doc.id ? 600 : 400, color: "inherit", width: "100%",
                      }}>
                        <FileText size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Number of Cards: {count}</label>
                <input type="range" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} style={{ width: "100%", accentColor: "#7C3AED" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--vp-text-3)" }}>
                  <span>5</span><span>30</span>
                </div>
              </div>

              <button className="vp-btn vp-btn-primary" onClick={handleGenerate} disabled={generating || !selectedDoc}
                style={{ width: "100%", height: 42, justifyContent: "center", opacity: generating || !selectedDoc ? 0.6 : 1, cursor: generating || !selectedDoc ? "not-allowed" : "pointer" }}>
                {generating ? (
                  <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating flashcards...</>
                ) : (
                  <><Sparkles size={14} /> Generate Flashcards</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
