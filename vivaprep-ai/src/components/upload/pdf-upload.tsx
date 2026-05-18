"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  documentId?: string;
}

interface PDFUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export function PDFUpload({ onUploadComplete }: PDFUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 100MB limit`);
          continue;
        }

        const uploadFile: UploadedFile = {
          file,
          progress: 0,
          status: "uploading",
        };

        setFiles((prev) => [...prev, uploadFile]);

        try {
          const formData = new FormData();
          formData.append("file", file);

          const progressInterval = setInterval(() => {
            setFiles((prev) =>
              prev.map((f) =>
                f.file === file && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          clearInterval(progressInterval);

          if (res.ok) {
            const data = await res.json();
            setFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? { ...f, progress: 100, status: "processing", documentId: data.id }
                  : f
              )
            );

            setTimeout(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.file === file ? { ...f, status: "done" } : f
                )
              );
              onUploadComplete?.(data.id);
              toast.success(`${file.name} processed successfully!`);
            }, 2000);
          } else {
            throw new Error("Upload failed");
          }
        } catch {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, status: "error" } : f
            )
          );
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 100 * 1024 * 1024,
  });

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
          isDragActive
            ? "border-violet-500 bg-violet-500/5"
            : "border-border hover:border-violet-400 hover:bg-violet-500/5"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/10 to-indigo-600/10">
            <Upload className="h-7 w-7 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse. PDF only, max 100MB
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div
            key={`${f.file.name}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{f.file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(f.file.size)}</p>
              {f.status === "uploading" && (
                <Progress value={f.progress} className="mt-1.5 h-1" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {f.status === "uploading" && (
                <span className="text-xs text-muted-foreground">{f.progress}%</span>
              )}
              {f.status === "processing" && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing
                </div>
              )}
              {f.status === "done" && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
              {f.status === "error" && (
                <span className="text-xs text-red-600">Failed</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeFile(f.file)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
