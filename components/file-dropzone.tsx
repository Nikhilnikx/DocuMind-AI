"use client";

import { Upload, CheckCircle, AlertCircle, X, ScanLine, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { useFileExtract } from "@/hooks/use-file-extract";

type FileExtract = ReturnType<typeof useFileExtract>;

interface FileDropZoneProps {
  extract: FileExtract;
  className?: string;
  compact?: boolean;
}

export function FileDropZone({ extract, className, compact = false }: FileDropZoneProps) {
  const { dropzone, fileName, charCount, pageCount, error, extracting, text, progress, reset } = extract;
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  const hasText = !!text;
  const isScanning = extracting && progress?.stage === "ocr";
  const pct = progress?.percent ?? 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl cursor-pointer transition-all",
          compact ? "p-4" : "p-7",
          isDragActive && "border-purple-500 bg-purple-500/10",
          !isDragActive && hasText && !extracting && "border-emerald-500/40 bg-emerald-500/5",
          !isDragActive && !hasText && !error && !extracting && "border-white/10 hover:border-purple-500/30 hover:bg-white/[0.02]",
          !isDragActive && error && !extracting && "border-red-500/30 bg-red-500/5",
          extracting && "border-purple-500/40 bg-purple-500/5 cursor-default",
        )}
        onClick={(e) => extracting && e.stopPropagation()}
      >
        <input {...getInputProps()} disabled={extracting} />

        {extracting ? (
          /* OCR / extraction progress */
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                <ScanLine size={18} className="text-purple-400 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{fileName}</p>
                <p className="text-xs text-purple-300 mt-0.5">{progress?.message ?? "Processing..."}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-600">
                  {isScanning && progress
                    ? `Page ${progress.page} of ${progress.totalPages}`
                    : progress?.stage === "loading" ? "Loading file..."
                    : progress?.stage === "rendering" ? "Rendering pages..."
                    : "Extracting text..."}
                </span>
                <span className="text-[10px] text-purple-400 font-medium">{pct}%</span>
              </div>
            </div>

            {isScanning && progress && progress.totalPages > 1 && (
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: progress.totalPages }, (_, i) => i + 1).map((p) => (
                  <div
                    key={p}
                    className={cn(
                      "w-5 h-5 rounded text-[9px] flex items-center justify-center font-medium border transition-all",
                      p < progress.page ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : p === progress.page ? "bg-purple-500/30 border-purple-500/50 text-purple-300 animate-pulse"
                      : "bg-white/3 border-white/8 text-gray-600"
                    )}
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : hasText ? (
          /* Success state */
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{fileName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(charCount / 1000).toFixed(1)}k characters extracted
                  {pageCount > 1 ? ` · ${pageCount} pages` : ""}
                  {" "}· <span className="text-emerald-400">ready</span>
                </p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors"
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Idle / drag state */
          <div className={cn("flex items-center gap-4", !compact && "flex-col text-center")}>
            <div className={cn(
              "rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0 transition-colors group-hover:border-purple-500/30",
              compact ? "w-10 h-10" : "w-14 h-14"
            )}>
              {isDragActive
                ? <FileText size={compact ? 18 : 22} className="text-purple-400" />
                : <Upload size={compact ? 18 : 22} className="text-gray-400" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isDragActive ? "Drop to scan..." : "Upload & scan document"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                PDF (digital or scanned), DOCX, TXT, JPG, PNG — up to 100MB
              </p>
              <p className="text-xs text-purple-400/70 mt-1">
                ✦ Scanned books & image PDFs supported via OCR
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-red-400">{error}</p>
            <button onClick={reset} className="text-xs text-red-300 underline mt-1">Try again</button>
          </div>
        </div>
      )}
    </div>
  );
}
