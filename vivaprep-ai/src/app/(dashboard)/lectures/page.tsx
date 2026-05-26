"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Presentation,
  FileCode2,
  Search,
  Upload,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { PDFUpload } from "@/components/upload/pdf-upload";
import {
  timeAgo,
  formatFileSize,
  cleanDocumentTitle,
  getFileTypeInfo,
} from "@/lib/format";

interface DocumentData {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  mimeType: string;
  status: "PROCESSING" | "READY" | "FAILED";
  createdAt: string;
  topics: { id: string; name: string }[];
  _count: { quizzes: number; flashcardSets: number };
}

function FileTypeIcon({
  fileName,
  size = 20,
}: {
  fileName: string;
  size?: number;
}) {
  const ext = fileName.toLowerCase().match(/\.[a-z]+$/)?.[0] || "";
  if (ext === ".pptx" || ext === ".ppt")
    return <Presentation size={size} color="white" />;
  if (ext === ".md") return <FileCode2 size={size} color="white" />;
  return <FileText size={size} color="white" />;
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
    cleanDocumentTitle(d.title)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            My Lectures
          </h1>
          <p
            style={{
              color: "var(--vp-text-2)",
              margin: "6px 0 0",
              fontSize: 14,
            }}
          >
            Manage your uploaded documents and study materials
          </p>
        </div>
        <button
          className="vp-btn vp-btn-primary"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="vp-card fade-up" style={{ marginBottom: 24 }}>
          <PDFUpload onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--vp-text-3)",
          }}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 40,
              color: "var(--vp-text-3)",
            }}
          >
            <Loader2
              size={16}
              className="animate-spin"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <span style={{ fontSize: 14 }}>Loading lectures...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--vp-text-3)",
            }}
          >
            <FileText
              size={36}
              style={{ margin: "0 auto 16px", opacity: 0.3 }}
            />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
              {search ? "No lectures match your search" : "No lectures yet"}
            </div>
            <div style={{ fontSize: 13 }}>
              {search
                ? "Try a different search term"
                : "Upload a PDF, PPTX, or Markdown file to get started"}
            </div>
          </div>
        ) : (
          filtered.map((doc, i, arr) => {
            const status = doc.status.toLowerCase();
            const displayTitle = cleanDocumentTitle(doc.title);
            const ft = getFileTypeInfo(doc.fileName);
            const pageLabel =
              doc.pageCount === 1
                ? "1 page"
                : `${doc.pageCount} pages`;
            const totalContent =
              doc._count.quizzes + doc._count.flashcardSets;

            return (
              <Link
                key={doc.id}
                href={`/lectures/${doc.id}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "18px 20px",
                  borderBottom:
                    i < arr.length - 1
                      ? "1px solid var(--vp-border)"
                      : "none",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background 0.15s",
                }}
              >
                {/* File type icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: ft.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <FileTypeIcon fileName={doc.fileName} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row with file type badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayTitle}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: ft.bgColor,
                        color: ft.color,
                        flexShrink: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      {ft.label}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--vp-text-3)",
                    }}
                  >
                    {doc.pageCount > 0 && (
                      <>
                        <span>{pageLabel}</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                      </>
                    )}
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{timeAgo(doc.createdAt)}</span>
                  </div>

                  {/* Topics */}
                  {doc.topics.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginTop: 10,
                      }}
                    >
                      {doc.topics.slice(0, 5).map((t) => (
                        <span
                          key={t.id}
                          className="chip"
                          style={{ height: 22, fontSize: 10 }}
                        >
                          {t.name}
                        </span>
                      ))}
                      {doc.topics.length > 5 && (
                        <span
                          className="chip"
                          style={{
                            height: 22,
                            fontSize: 10,
                            opacity: 0.6,
                          }}
                        >
                          +{doc.topics.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: stats + status */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {totalContent > 0 && (
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 11,
                        color: "var(--vp-text-3)",
                        lineHeight: 1.5,
                      }}
                    >
                      <div>
                        {doc._count.quizzes}{" "}
                        {doc._count.quizzes === 1 ? "quiz" : "quizzes"}
                      </div>
                      <div>
                        {doc._count.flashcardSets}{" "}
                        {doc._count.flashcardSets === 1 ? "set" : "sets"}
                      </div>
                    </div>
                  )}
                  <span
                    className="chip"
                    style={{
                      height: 22,
                      fontSize: 10,
                      background:
                        status === "processing"
                          ? "rgba(245,158,11,0.15)"
                          : status === "failed"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(16,185,129,0.15)",
                      borderColor:
                        status === "processing"
                          ? "rgba(245,158,11,0.3)"
                          : status === "failed"
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(16,185,129,0.3)",
                      color:
                        status === "processing"
                          ? "#F59E0B"
                          : status === "failed"
                            ? "#EF4444"
                            : "#10B981",
                    }}
                  >
                    {status === "processing" && (
                      <span className="dot dot-live" />
                    )}
                    {status}
                  </span>
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--vp-text-3)", opacity: 0.5 }}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
