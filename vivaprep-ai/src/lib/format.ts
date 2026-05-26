/**
 * Shared formatting utilities used across multiple pages
 */

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}

export function formatModeName(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
}

/**
 * Clean up a raw document title (from filename) for display.
 * Strips UUIDs, hex hashes, splits CamelCase, normalizes spacing.
 */
export function cleanDocumentTitle(raw: string): string {
  let title = raw
    // Strip file extensions if still present
    .replace(/\.(pdf|pptx|ppt|md|txt|docx)$/i, "")
    // Remove UUIDs with dashes OR spaces as separators
    // e.g. "e1259c79-416e-4e56-8715-886a22f5c920" or "e1259c79 416e 4e56 8715 886a22f5c920"
    .replace(
      /[0-9a-f]{8}[\s-][0-9a-f]{4}[\s-][0-9a-f]{4}[\s-][0-9a-f]{4}[\s-][0-9a-f]{12}/gi,
      ""
    )
    // Remove UUIDs without any separators (32 hex chars)
    .replace(/[0-9a-f]{32}/gi, "")
    // Remove standalone pure-digit tokens of 4+ digits (like "99133")
    .replace(/(?<=\s|^)\d{4,}(?=\s|$)/g, "")
    // Split CamelCase: "Week1Lecture" → "Week 1 Lecture"
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    // Replace underscores and hyphens with spaces
    .replace(/[-_]+/g, " ")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize first letter of each word if it looks all-lowercase
  if (title === title.toLowerCase()) {
    title = title.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return title || "Untitled Document";
}

/** Get file type info from a filename extension */
export function getFileTypeInfo(fileName: string): {
  type: "pdf" | "pptx" | "md" | "unknown";
  label: string;
  color: string;
  bgColor: string;
  darkBgColor: string;
  gradient: string;
} {
  const ext = fileName.toLowerCase().match(/\.[a-z]+$/)?.[0] || "";
  switch (ext) {
    case ".pptx":
    case ".ppt":
      return {
        type: "pptx",
        label: "PPTX",
        color: "#EA580C",
        bgColor: "rgba(234,88,12,0.12)",
        darkBgColor: "rgba(234,88,12,0.2)",
        gradient: "linear-gradient(135deg, #EA580C, #FB923C)",
      };
    case ".md":
      return {
        type: "md",
        label: "MD",
        color: "#2563EB",
        bgColor: "rgba(37,99,235,0.12)",
        darkBgColor: "rgba(37,99,235,0.2)",
        gradient: "linear-gradient(135deg, #2563EB, #60A5FA)",
      };
    default:
      return {
        type: "pdf",
        label: "PDF",
        color: "#DC2626",
        bgColor: "rgba(220,38,38,0.12)",
        darkBgColor: "rgba(220,38,38,0.2)",
        gradient: "linear-gradient(135deg, #DC2626, #F87171)",
      };
  }
}
