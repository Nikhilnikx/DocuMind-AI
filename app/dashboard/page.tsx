"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  MessageSquare,
  Star,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { FileIcon, getFileType, type FileType } from "@/components/file-icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatDate, formatFileSize, cn } from "@/lib/utils";
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
    id: "1",
    name: "Q3 product strategy.pdf",
    type: "pdf",
    pages: 18,
    size: 2400000,
    status: "ready",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    starred: false,
  },
  {
    id: "2",
    name: "Customer onboarding.docx",
    type: "docx",
    pages: 7,
    size: 540000,
    status: "ready",
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    starred: false,
  },
  {
    id: "3",
    name: "Market research.txt",
    type: "txt",
    pages: 4,
    size: 120000,
    status: "processing",
    created_at: new Date("2024-10-24").toISOString(),
    starred: false,
  },
];

const FILE_TYPES = ["all", "pdf", "docx", "txt"] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<MockDoc[]>(initialDocs);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MockDoc | null>(null);

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
        setDocs((prev) =>
          prev.map((d) => (d.id === newDoc.id ? { ...d, status: "ready" } : d))
        );
      }, 3000);
    });
    setTimeout(() => setUploading(false), 500);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const toggleStar = (id: string) =>
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d))
    );

  const confirmDelete = (doc: MockDoc) => setDeleteTarget(doc);

  const executeDelete = () => {
    if (deleteTarget) {
      setDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const filteredDocs =
    filter === "all" ? docs : docs.filter((d) => d.type === filter);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 uppercase tracking-widest font-medium">
            <span className="text-purple-400">WORKSPACE</span>
            <span aria-hidden="true">/</span>
            <span>DOCUMENTS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
            Your document library
          </h1>
          <p className="text-gray-400">
            One place for the context behind your best work.
          </p>
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/25"
        >
          <MessageSquare size={16} aria-hidden="true" />
          Open chat
        </button>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 md:p-10 mb-8 transition-all duration-200 cursor-pointer group",
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        )}
        role="button"
        aria-label="Upload documents. Drag and drop or click to browse."
        tabIndex={0}
      >
        <input {...getInputProps()} aria-label="File upload input" />
        <div className="flex items-center gap-5">
          <div
            className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all"
            aria-hidden="true"
          >
            {uploading ? (
              <Loader2
                size={22}
                className="text-purple-400 animate-spin"
              />
            ) : (
              <Upload
                size={22}
                className="text-gray-400 group-hover:text-purple-400 transition-colors"
              />
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-base">
              {isDragActive ? "Drop files here…" : "Drop documents here"}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              or{" "}
              <span className="text-purple-400 underline underline-offset-2 cursor-pointer">
                browse files
              </span>{" "}
              · PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT — up to 100MB
            </p>
          </div>
        </div>
      </div>

      {/* Document list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">All documents</h2>
            <span className="text-sm bg-white/8 text-gray-300 px-2.5 py-0.5 rounded-full font-medium">
              {filteredDocs.length}
            </span>
          </div>
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/8 rounded-lg px-3 py-2 hover:bg-white/8 transition-colors"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              aria-label={`Filter by type: ${filter === "all" ? "All types" : filter.toUpperCase()}`}
            >
              <span>
                {filter === "all" ? "All types" : filter.toUpperCase()}
              </span>
              <ChevronDown size={12} aria-hidden="true" />
            </button>
            {filterOpen && (
              <div
                className="absolute right-0 mt-1.5 w-40 rounded-xl border border-white/10 bg-[#1a1b2e] shadow-2xl overflow-hidden z-20"
                role="listbox"
                aria-label="File type filter"
              >
                {FILE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setFilter(t);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm transition-colors",
                      filter === t
                        ? "bg-purple-500/15 text-purple-300"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    )}
                    role="option"
                    aria-selected={filter === t}
                  >
                    {t === "all" ? "All types" : t.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border border-white/8 rounded-2xl overflow-hidden divide-y divide-white/5">
          <AnimatePresence>
            {filteredDocs.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Upload
                  size={32}
                  className="mx-auto mb-3 opacity-30"
                  aria-hidden="true"
                />
                <p>No documents yet. Upload your first file above.</p>
              </div>
            ) : (
              filteredDocs.map((doc, i) => (
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
                    <p className="text-sm font-semibold text-white truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doc.pages} pages · {formatFileSize(doc.size)} ·{" "}
                      {formatDate(doc.created_at)}
                    </p>
                  </div>

                  {/* Status */}
                  {doc.status === "ready" ? (
                    <span className="text-xs text-emerald-400 font-medium">
                      Ready
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-amber-400 font-medium">
                        Processing
                      </span>
                    </div>
                  )}

                  {/* Actions — always visible on touch, hover-only on desktop */}
                  <div className="flex items-center gap-1 hover-only-actions opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push("/chat")}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors"
                      aria-label={`Chat about ${doc.name}`}
                    >
                      Chat →
                    </button>
                    <button
                      onClick={() => toggleStar(doc.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        doc.starred
                          ? "text-amber-400 hover:bg-amber-500/10"
                          : "text-gray-500 hover:text-amber-400 hover:bg-white/5"
                      )}
                      aria-label={doc.starred ? `Unstar ${doc.name}` : `Star ${doc.name}`}
                      aria-pressed={doc.starred}
                    >
                      <Star
                        size={15}
                        fill={doc.starred ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => confirmDelete(doc)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`Delete ${doc.name}`}
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

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete document"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={executeDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
