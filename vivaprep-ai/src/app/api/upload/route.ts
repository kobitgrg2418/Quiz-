import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDocument } from "@/services/ai/pdf-processor";
import { rateLimit, UPLOAD_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeInput, safeError, logSecurityEvent } from "@/lib/security";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const ALLOWED_TYPES: Record<string, { extensions: string[]; label: string }> = {
  "application/pdf": { extensions: [".pdf"], label: "PDF" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    extensions: [".pptx"],
    label: "PPTX",
  },
  "text/markdown": { extensions: [".md"], label: "Markdown" },
  "text/plain": { extensions: [".md", ".txt"], label: "Text" },
};

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to upload" },
        { status: 401 }
      );
    }

    const rl = rateLimit(`upload:${session.user.id}`, UPLOAD_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Upload rate limit exceeded. Try again in ${rl.resetInSeconds}s` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine effective MIME type — browsers may send .md as text/plain
    let mimeType = file.type;
    if (
      mimeType === "text/plain" &&
      file.name.toLowerCase().endsWith(".md")
    ) {
      mimeType = "text/markdown";
    }

    if (!ALLOWED_TYPES[mimeType]) {
      return NextResponse.json(
        { error: "Only PDF, PPTX, and Markdown files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 4MB limit" },
        { status: 400 }
      );
    }

    const fileName = file.name.replace(/[^\w\s.\-()]/gi, "").slice(0, 200);
    const ext = fileName.toLowerCase().match(/\.[a-z]+$/)?.[0] || "";
    const allowedExts = Object.values(ALLOWED_TYPES).flatMap((t) => t.extensions);
    if (!fileName || !allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file name" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Verify magic bytes for binary formats
    if (mimeType === "application/pdf") {
      const header = buffer.slice(0, 5).toString("ascii");
      if (header !== "%PDF-") {
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        logSecurityEvent({
          type: "suspicious_request",
          ip,
          userId: session.user.id,
          details: `Uploaded file with .pdf extension but invalid magic bytes: ${header}`,
          timestamp: new Date(),
        });
        return NextResponse.json(
          { error: "Invalid PDF file" },
          { status: 400 }
        );
      }
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      const header = buffer.slice(0, 2).toString("ascii");
      if (header !== "PK") {
        return NextResponse.json(
          { error: "Invalid PPTX file" },
          { status: 400 }
        );
      }
    }

    const title = sanitizeInput(
      fileName.replace(/\.(pdf|pptx|md|txt)$/i, "").replace(/[-_]/g, " ")
    );

    const document = await prisma.document.create({
      data: {
        title,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        fileSize: file.size,
        mimeType,
        userId: session.user.id,
        status: "PROCESSING",
      },
    });

    try {
      await processDocument(buffer, document.id, mimeType);
    } catch (err) {
      console.error("Document processing failed:", err);
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      });
    }

    const updated = await prisma.document.findUnique({
      where: { id: document.id },
      select: { id: true, title: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Upload error:", safeError(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
