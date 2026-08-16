"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload, MessageSquare, Star, Trash2, ChevronDown, Loader2,
} from "lucide-react";
import { FileIcon, getFileType, type FileType } from "@/components/file-icon";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MockDoc {
  id: string;
  name: string;
  type: FileType;
  pages: number;
  size: number;
  status: "ready" | "processing";
  created_at: string;
  starred: boolean;
}

const initialDocs: MockDoc[] = [
  {
    id: "1", name: "Q3 product strategy.pdf", type: "pdf",
    pages: 18, size: 2400000, status: "ready",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), starred: false,
  },
  {
    id: "2", name: "Customer onboarding.docx", type: "docx",
    pages: 7, size: 540000, status: "ready",
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), starred: false,
  },
  {
    id: "3", name: "Market research.txt", type: "txt",
    pages: 4, size: 120000, status: "processing",
    created_at: new Date("2024-10-24").toISOString(), starred: false,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<MockDoc[]>(initialDocs);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    acceptedFiles.forEach((file) => {
      const type = getFileType(file.name);
      const newDoc: MockDoc = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type,
        pages: Math.floor(Math.random() * 30) + 1,
        size: file.size,
        status: "processing",
        created_at: new Date().toISOString(),
        starred: false,
      };
      setDocs((prev) => [newDoc, ...prev]);
      setTimeout(() => {
        setDocs((prev) => prev.map((d) => d.id === newDoc.id ? { ...d, status: "ready" } : d));
      }, 3000);
    });
    setTimeout(() => setUploading(false), 500);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
    maxSize: 100 * 1024 * 1024,
  });

  const toggleStar = (id: string) =>
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, starred: !d.starred } : d));

  const deleteDoc = (id: string) =>
    setDocs((prev) => prev.filter((d) => d.id !== id));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-widest font-medium">
            <span className="text-purple-400">WORKSPACE</span>
            <span>/</span>
            <span>DOCUMENTS</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-1">Your document library</h1>
          <p className="text-gray-400">One place for the context behind your best work.</p>
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/25"
        >
          <MessageSquare size={16} />
          Open chat
        </button>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 mb-8 transition-all duration-200 cursor-pointer group",
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all">
            {uploading
              ? <Loader2 size={22} className="text-purple-400 animate-spin" />
              : <Upload size={22} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
            }
          </div>
          <div>
            <p className="text-white font-semibold text-base">
              {isDragActive ? "Drop files here…" : "Drop documents here"}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              or{" "}
              <span className="text-purple-400 underline underline-offset-2 cursor-pointer">
                browse files
              </span>
              {" "}· PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT — up to 100MB
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs text-gray-600 bg-white/5 rounded-md px-2 py-1 border border-white/8">
            <span className="font-mono">⌘ U</span>
          </div>
        </div>
      </div>

      {/* Document list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">All documents</h2>
            <span className="text-sm bg-white/8 text-gray-300 px-2.5 py-0.5 rounded-full font-medium">
              {docs.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/8 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/8 transition-colors">
            <span>All types</span>
            <ChevronDown size={12} />
          </div>
        </div>

        <div className="border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
          <AnimatePresence>
            {docs.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Upload size={32} className="mx-auto mb-3 opacity-30" />
                <p>No documents yet. Upload your first file above.</p>
              </div>
            ) : (
              docs.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors group"
                >
                  <FileIcon type={doc.type} size="md" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.pages} pages · {formatDate(doc.created_at)}
                    </p>
                  </div>

                  {/* Status */}
                  {doc.status === "ready" ? (
                    <span className="text-xs text-emerald-400 font-medium">Ready</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs text-amber-400 font-medium">Processing</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push("/chat")}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                    >
                      Chat →
                    </button>
                    <button
                      onClick={() => toggleStar(doc.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        doc.starred
                          ? "text-amber-400 hover:bg-amber-500/10"
                          : "text-gray-600 hover:text-amber-400 hover:bg-white/5"
                      )}
                    >
                      <Star size={15} fill={doc.starred ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
