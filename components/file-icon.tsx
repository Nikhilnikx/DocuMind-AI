"use client";
import { cn } from "@/lib/utils";

export type FileType = "pdf" | "docx" | "xlsx" | "pptx" | "txt" | "file";

interface FileIconProps {
  type: FileType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STYLES: Record<FileType, string> = {
  pdf:  "bg-red-500/15 text-red-400 border-red-500/20",
  docx: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  xlsx: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  pptx: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  txt:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
  file: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

const LABELS: Record<FileType, string> = {
  pdf: "PDF", docx: "DOC", xlsx: "XLS", pptx: "PPT", txt: "TXT", file: "FILE",
};

export function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return "xlsx";
  if (ext === "pptx" || ext === "ppt") return "pptx";
  if (ext === "txt") return "txt";
  return "file";
}

export function FileIcon({ type, size = "md", className }: FileIconProps) {
  const sizeClasses = { sm: "w-8 h-8 text-[9px]", md: "w-10 h-10 text-[10px]", lg: "w-12 h-12 text-xs" };
  return (
    <div className={cn("rounded-lg border flex items-center justify-center font-bold shrink-0",
      STYLES[type], sizeClasses[size], className)}>
      {LABELS[type]}
    </div>
  );
}
