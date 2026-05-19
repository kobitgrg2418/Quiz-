import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processPDF } from "@/services/ai/pdf-processor";
import { rateLimit, UPLOAD_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeInput, safeError, logSecurityEvent } from "@/lib/security";

// Vercel Hobby plan has 4.5MB body limit
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

// Allow longer execution for PDF processing
export const maxDuration = 60; // 60 seconds (max for Hobby plan)

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

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 4MB limit" },
        { status: 400 }
      );
    }

    // Validate file name (no path traversal, reasonable length)
    const fileName = file.name.replace(/[^\w\s.\-()]/gi, "").slice(0, 200);
    if (!fileName || !fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Invalid file name" },
        { status: 400 }
      );
    }

    // Verify PDF magic bytes (%PDF-)
    const buffer = Buffer.from(await file.arrayBuffer());
    const header = buffer.slice(0, 5).toString("ascii");
    if (header !== "%PDF-") {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
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

    const title = sanitizeInput(fileName.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));

    const document = await prisma.document.create({
      data: {
        title,
        fileName: fileName,
        fileUrl: `/uploads/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        userId: session.user.id,
        status: "PROCESSING",
      },
    });

    // Process synchronously — Vercel kills background tasks after response is sent
    try {
      await processPDF(buffer, document.id);
    } catch (err) {
      console.error("PDF processing failed:", err);
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "FAILED" },
      });
    }

    // Fetch updated status
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
