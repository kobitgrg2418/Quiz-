"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Search, Upload, ChevronRight } from "lucide-react";
import { PDFUpload } from "@/components/upload/pdf-upload";

const mockDocuments = [
  { id: "1", title: "Machine Learning Fundamentals", pages: 45, size: "2.4 MB", status: "ready", time: "2 hours ago", topics: ["ML", "Neural Networks"], quizzes: 3, sets: 2 },
  { id: "2", title: "Data Structures & Algorithms", pages: 32, size: "1.8 MB", status: "ready", time: "1 day ago", topics: ["Arrays", "Trees"], quizzes: 5, sets: 4 },
  { id: "3", title: "Organic Chemistry Chapter 5", pages: 28, size: "3.2 MB", status: "processing", time: "3 days ago", topics: ["Reactions"], quizzes: 0, sets: 0 },
  { id: "4", title: "Operating Systems — Chapter 5", pages: 84, size: "4.2 MB", status: "ready", time: "5 days ago", topics: ["Scheduling", "Memory"], quizzes: 8, sets: 6 },
];

export default function LecturesPage() {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = mockDocuments.filter((d) =>
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
          <Upload size={14} /> Upload PDF
        </button>
      </div>

      {showUpload && (
        <div className="vp-card fade-up" style={{ marginBottom: 24 }}>
          <PDFUpload onUploadComplete={() => setShowUpload(false)} />
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
        {filtered.map((doc, i, arr) => (
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
                <span>{doc.pages} pages</span>
                <span>·</span>
                <span>{doc.size}</span>
                <span>·</span>
                <span>{doc.time}</span>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {doc.topics.map((t) => (
                  <span key={t} className="chip" style={{ height: 20, fontSize: 10 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right", fontSize: 11, color: "var(--vp-text-3)" }}>
                <div>{doc.quizzes} quizzes · {doc.sets} sets</div>
              </div>
              <span className="chip" style={{
                height: 22,
                fontSize: 10,
                background: doc.status === "processing" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                borderColor: doc.status === "processing" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)",
                color: doc.status === "processing" ? "#F59E0B" : "#10B981",
              }}>
                {doc.status === "processing" && <span className="dot dot-live" />}
                {doc.status}
              </span>
              <ChevronRight size={16} style={{ color: "var(--vp-text-3)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
