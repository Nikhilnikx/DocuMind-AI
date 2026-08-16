"use client";

import { useState, useCallback } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import type { OCRProgress } from "@/lib/ocr";

export interface ExtractState {
  text: string;
  fileName: string;
  fileType: string;
  charCount: number;
  pageCount: number;
  error: string;
  extracting: boolean;
  progress: OCRProgress | null;
}

const INITIAL: ExtractState = {
  text: "", fileName: "", fileType: "", charCount: 0,
  pageCount: 0, error: "", extracting: false, progress: null,
};

/** Send file to server API and get extracted text back */
async function extractViaServer(file: File, onProgress: (p: OCRProgress) => void): Promise<string> {
  onProgress({ stage: "loading", page: 0, totalPages: 0, percent: 20, message: `Reading ${file.name.split(".").pop()?.toUpperCase()}…` });
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/extract", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Server extraction failed.");
  onProgress({ stage: "done", page: 1, totalPages: 1, percent: 100, message: "Done" });
  return data.text as string;
}

export function useFileExtract() {
  const [state, setState] = useState<ExtractState>(INITIAL);

  const extractFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    setState({
      ...INITIAL, fileName: file.name, fileType: ext, extracting: true,
      progress: { stage: "loading", page: 0, totalPages: 0, percent: 1, message: "Preparing…" },
    });

    const onProgress = (p: OCRProgress) => setState((s) => ({ ...s, progress: p }));

    try {
      let text = "";

      if (ext === "pdf") {
        // Try client-side OCR first, fall back to server if pdfjs fails
        try {
          const { extractPDFWithOCR } = await import("@/lib/ocr");
          text = await extractPDFWithOCR(file, onProgress);
        } catch (clientErr) {
          console.warn("Client PDF extraction failed, trying server…", clientErr);
          onProgress({ stage: "loading", page: 0, totalPages: 0, percent: 30, message: "Trying server extraction…" });
          text = await extractViaServer(file, onProgress);
        }

      } else if (["jpg", "jpeg", "png", "webp", "tiff", "tif", "bmp"].includes(ext)) {
        const { extractImageWithOCR } = await import("@/lib/ocr");
        text = await extractImageWithOCR(file, onProgress);

      } else if (["docx", "doc", "xlsx", "xls", "csv", "pptx", "ppt", "txt"].includes(ext)) {
        // All Office formats → server extraction
        text = await extractViaServer(file, onProgress);

      } else {
        throw new Error(`Unsupported format ".${ext}". Upload PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, or TXT.`);
      }

      if (!text.trim()) throw new Error("No text found in the file. It may be empty or image-only.");

      const pageCount = (text.match(/--- Page Break ---/g) ?? []).length + 1;

      setState({
        text: text.slice(0, 120000),
        fileName: file.name, fileType: ext,
        charCount: text.length, pageCount,
        error: "", extracting: false,
        progress: {
          stage: "done", page: pageCount, totalPages: pageCount, percent: 100,
          message: `Extracted ${text.length.toLocaleString()} characters from ${pageCount} page${pageCount !== 1 ? "s" : ""}`,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error during extraction.";
      console.error("Extract error:", err);
      setState({ ...INITIAL, fileName: file.name, fileType: ext, error: msg });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL), []);

  const dropzoneOptions: DropzoneOptions = {
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    onDrop: (files) => { if (files[0]) extractFile(files[0]); },
  };

  const dropzone = useDropzone(dropzoneOptions);
  return { ...state, dropzone, extractFile, reset };
}
