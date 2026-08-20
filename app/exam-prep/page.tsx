"use client";

import { useState } from "react";
import {
  GraduationCap,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { FileDropZone } from "@/components/file-dropzone";
import { ErrorBanner } from "@/components/error-banner";
import { PageLayout } from "@/components/page-layout";
import { useFileExtract } from "@/hooks/use-file-extract";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "flashcards" | "topics" | "qa";

interface Flashcard {
  front: string;
  back: string;
}
interface Topic {
  topic: string;
  importance: "high" | "medium" | "low";
  summary: string;
}
interface QAItem {
  q: string;
  a: string;
}

export default function ExamPrepPage() {
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [tab, setTab] = useState<Tab>("flashcards");

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState("");

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const fileExtract = useFileExtract();
  const activeText = inputMode === "paste" ? pastedText : fileExtract.text;
  const hasContent = activeText.trim().length > 0;

  const handleGenerate = async () => {
    if (!hasContent) return;
    setLoading(true);
    setGenError("");
    try {
      const res = await fetch("/api/exam-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, model }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error ?? "Failed to generate exam prep.");
        setLoading(false);
        return;
      }
      setFlashcards(data.flashcards ?? []);
      setTopics(data.topics ?? []);
      setQaList(data.qa ?? []);
      setGenerated(true);
      setCardIndex(0);
      setFlipped(false);
    } catch {
      setGenError(
        "Could not connect to the AI service. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "flashcards",
      label: `Flashcards${flashcards.length ? ` (${flashcards.length})` : ""}`,
      icon: <RotateCcw size={14} aria-hidden="true" />,
    },
    {
      id: "topics",
      label: `Key Topics${topics.length ? ` (${topics.length})` : ""}`,
      icon: <BookOpen size={14} aria-hidden="true" />,
    },
    {
      id: "qa",
      label: "Q&A Practice",
      icon: <MessageSquare size={14} aria-hidden="true" />,
    },
  ];

  /* ── SETUP ── */
  if (!generated) {
    return (
      <PageLayout
        breadcrumb={[{ label: "AI Tools", highlight: true }, { label: "Exam Prep" }]}
        title="Exam Prep"
        description="Flashcards, key topics, and Q&A from your document."
        actions={<ModelSelector value={model} onChange={setModel} />}
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#111320] border border-white/8 rounded-2xl p-6 space-y-5">
            <div
              className="flex rounded-xl bg-white/5 border border-white/8 p-1 gap-1"
              role="tablist"
              aria-label="Input mode"
            >
              {(["upload", "paste"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setInputMode(m)}
                  role="tab"
                  aria-selected={inputMode === m}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                    inputMode === m
                      ? "bg-purple-600 text-white shadow"
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  {m === "upload" ? "Upload File" : "Paste Text"}
                </button>
              ))}
            </div>

            {inputMode === "upload" ? (
              <FileDropZone extract={fileExtract} />
            ) : (
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your notes, textbook content, or study material..."
                rows={8}
                aria-label="Document text for exam preparation"
                className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 resize-none scrollbar-thin"
              />
            )}

            {hasContent && (
              <p className="text-xs text-gray-400">
                {activeText.length.toLocaleString()} characters ready
              </p>
            )}

            {genError && (
              <ErrorBanner message={genError} onRetry={handleGenerate} />
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !hasContent || fileExtract.extracting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <GraduationCap size={16} aria-hidden="true" />
              )}
              {loading
                ? "Preparing your exam prep..."
                : fileExtract.extracting
                  ? "Extracting file..."
                  : "Start Exam Prep"}
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  /* ── GENERATED ── */
  const card = flashcards[cardIndex];

  return (
    <PageLayout
      breadcrumb={[{ label: "AI Tools", highlight: true }, { label: "Exam Prep" }]}
      title="Exam Prep"
      actions={
        <>
          <ModelSelector value={model} onChange={setModel} />
          <button
            onClick={() => {
              setGenerated(false);
              fileExtract.reset();
              setPastedText("");
            }}
            className="text-xs text-gray-400 hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            ← New
          </button>
        </>
      }
    >
      {fileExtract.fileName && (
        <p className="text-sm text-gray-400 -mt-4 mb-6">
          {fileExtract.fileName}
        </p>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1 mb-6"
        role="tablist"
        aria-label="Exam prep sections"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            role="tab"
            aria-selected={tab === t.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all",
              tab === t.id
                ? "bg-purple-600 text-white shadow"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Flashcards */}
      {tab === "flashcards" && (
        <div>
          {flashcards.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No flashcards generated.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">
                  {cardIndex + 1} / {flashcards.length}
                </span>
                <span className="text-xs text-gray-500">Click to flip</span>
              </div>
              <div
                className="relative h-56 cursor-pointer mb-4"
                onClick={() => setFlipped(!flipped)}
                role="button"
                aria-label={`Flashcard ${cardIndex + 1}. ${flipped ? "Answer" : "Question"}. Click to flip.`}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  (e.preventDefault(), setFlipped(!flipped))
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={flipped ? "back" : "front"}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                      "absolute inset-0 rounded-2xl border p-8 flex flex-col items-center justify-center text-center",
                      flipped
                        ? "bg-purple-900/20 border-purple-500/30"
                        : "bg-[#111320] border-white/8"
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-3 text-gray-400">
                      {flipped ? "Answer" : "Question"}
                    </p>
                    <p className="text-base font-medium text-white leading-relaxed">
                      {flipped ? card.back : card.front}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setCardIndex((i) => Math.max(0, i - 1));
                    setFlipped(false);
                  }}
                  disabled={cardIndex === 0}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Previous flashcard"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setFlipped(!flipped)}
                  className="px-5 py-2 rounded-xl bg-white/5 border border-white/8 text-sm text-gray-300 hover:bg-white/8 transition-colors"
                >
                  Flip card
                </button>
                <button
                  onClick={() => {
                    setCardIndex((i) =>
                      Math.min(flashcards.length - 1, i + 1)
                    );
                    setFlipped(false);
                  }}
                  disabled={cardIndex === flashcards.length - 1}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Next flashcard"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div
                className="flex justify-center gap-1.5 mt-4"
                role="tablist"
                aria-label="Flashcard progress"
              >
                {flashcards.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      i === cardIndex ? "bg-purple-400" : "bg-white/15"
                    )}
                    role="tab"
                    aria-selected={i === cardIndex}
                    aria-label={`Flashcard ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Key Topics */}
      {tab === "topics" && (
        <div className="space-y-3">
          {topics.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No topics extracted.
            </p>
          ) : (
            topics.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#111320] border border-white/8"
              >
                <Lightbulb
                  size={15}
                  className={cn(
                    "mt-0.5 shrink-0",
                    t.importance === "high"
                      ? "text-amber-400"
                      : t.importance === "medium"
                        ? "text-blue-400"
                        : "text-gray-400"
                  )}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">
                      {t.topic}
                    </p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase",
                        t.importance === "high"
                          ? "bg-amber-500/15 text-amber-400"
                          : t.importance === "medium"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-gray-500/15 text-gray-400"
                      )}
                    >
                      {t.importance}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {t.summary}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Q&A */}
      {tab === "qa" && (
        <div className="space-y-4">
          {qaList.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              No Q&A generated.
            </p>
          ) : (
            qaList.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#111320] border border-white/8"
              >
                <p className="text-sm font-semibold text-purple-300 mb-2">
                  {item.q}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {item.a}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </PageLayout>
  );
}
