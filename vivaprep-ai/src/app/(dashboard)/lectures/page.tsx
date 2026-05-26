"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, Search, Upload, ChevronRight, Loader2 } from "lucide-react";
import { PDFUpload } from "@/components/upload/pdf-upload";
import { timeAgo, formatFileSize } from "@/lib/format";

interface DocumentData {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
  topics: { id: string; name: string }[];
  _count: { quizzes: number; flashcardSets: number };
}

export default function LecturesPage() {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const json = await res.json();
        // Support both paginated ({ data: [...] }) and flat array responses
        setDocuments(Array.isArray(json) ? json : json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchDocuments();
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
            My Lectures
          </h1>
          <p style={{ color: "var(--vp-text-2)", margin: "6px 0 0", fontSize: 14 }}>
            Manage your uploaded documents and study sets
          </p>
        </div>
        <button className="vp-btn vp-btn-primary" onClick={() => setShowUpload(!showUpload)}>
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {showUpload && (
        <div className="vp-card fade-up" style={{ marginBottom: 24 }}>
          <PDFUpload onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <Search
          size={14}
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--vp-text-3)" }}
        />
        <input
          placeholder="Search lectures..."
          className="vp-input"
          style={{ paddingLeft: 34, height: 38, fontSize: 13 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Document list */}
      <div className="vp-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 40, color: "var(--vp-text-3)" }}>
            <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 14 }}>Loading lectures...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--vp-text-3)" }}>
            <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              {search ? "No lectures match your search" : "No lectures yet"}
            </div>
            <div style={{ fontSize: 13 }}>
              {search ? "Try a different search term" : "Upload a PDF, PPTX, or Markdown file to get started"}
            </div>
          </div>
        ) : (
          filtered.map((doc, i, arr) => {
            const status = doc.status.toLowerCase();
            return (
              <Link
                key={doc.id}
                href={`/lectures/${doc.id}`}
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
                  background: "linear-gradient(135deg, #DC2626, #F87171)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FileText size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{doc.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--vp-text-3)" }}>
                    {doc.pageCount > 0 && <><span>{doc.pageCount} pages</span><span>·</span></>}
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span>{timeAgo(doc.createdAt)}</span>
                  </div>
                  {doc.topics.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {doc.topics.map((t) => (
                        <span key={t.id} className="chip" style={{ height: 20, fontSize: 10 }}>{t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right", fontSize: 11, color: "var(--vp-text-3)" }}>
                    <div>{doc._count.quizzes} quizzes · {doc._count.flashcardSets} sets</div>
                  </div>
                  <span className="chip" style={{
                    height: 22,
                    fontSize: 10,
                    background: status === "processing" ? "rgba(245,158,11,0.15)" : status === "failed" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                    borderColor: status === "processing" ? "rgba(245,158,11,0.3)" : status === "failed" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)",
                    color: status === "processing" ? "#F59E0B" : status === "failed" ? "#EF4444" : "#10B981",
                  }}>
                    {status === "processing" && <span className="dot dot-live" />}
                    {status}
                  </span>
                  <ChevronRight size={16} style={{ color: "var(--vp-text-3)" }} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
