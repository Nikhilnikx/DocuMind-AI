"use client";

import { useState } from "react";
import {
  Brain,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { FileDropZone } from "@/components/file-dropzone";
import { ErrorBanner } from "@/components/error-banner";
import { PageLayout } from "@/components/page-layout";
import { useFileExtract } from "@/hooks/use-file-extract";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";

interface MCQOption {
  label: string;
  text: string;
}
interface MCQQuestion {
  id: number;
  question: string;
  options: MCQOption[];
  answer: string;
  explanation: string;
}

type Stage = "setup" | "quiz" | "results";

export default function QuizPage() {
  const [pastedText, setPastedText] = useState("");
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [stage, setStage] = useState<Stage>("setup");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [inputMode, setInputMode] = useState<"paste" | "upload">("upload");

  const fileExtract = useFileExtract();
  const activeText = inputMode === "paste" ? pastedText : fileExtract.text;
  const hasContent = activeText.trim().length > 0;

  const generateQuiz = async () => {
    if (!hasContent) return;
    setLoading(true);
    setGenError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, model, numQuestions }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions?.length) {
        setGenError(
          data.error ?? "Could not generate quiz. Try a different document or model."
        );
        setLoading(false);
        return;
      }
      setQuestions(data.questions);
      setStage("quiz");
      setCurrent(0);
      setSelected({});
    } catch {
      setGenError(
        "Could not connect to the AI service. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qId: number, label: string) => {
    if (selected[qId]) return;
    setSelected((s) => ({ ...s, [qId]: label }));
    setShowExplanation(true);
  };

  const next = () => {
    setShowExplanation(false);
    if (current < questions.length - 1) setCurrent((c) => c + 1);
    else setStage("results");
  };

  const reset = () => {
    setStage("setup");
    setSelected({});
    setQuestions([]);
    setGenError("");
    fileExtract.reset();
    setPastedText("");
  };

  const score = questions.filter((q) => selected[q.id] === q.answer).length;
  const pct =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const q = questions[current];

  /* ── RESULTS ── */
  if (stage === "results") {
    return (
      <PageLayout
        breadcrumb={[{ label: "AI Tools", highlight: true }, { label: "MCQ Quiz" }]}
        title="Quiz Results"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111320] border border-white/8 rounded-2xl p-8 text-center"
          >
            <Trophy
              size={48}
              className={cn(
                "mx-auto mb-4",
                pct >= 80
                  ? "text-amber-400"
                  : pct >= 50
                    ? "text-purple-400"
                    : "text-gray-400"
              )}
              aria-hidden="true"
            />
            <h2 className="text-4xl font-black text-white mb-1">{pct}%</h2>
            <p className="text-gray-400 mb-1">
              {score} / {questions.length} correct
            </p>
            <p className="text-sm text-gray-400 mb-8">
              {pct >= 80
                ? "Excellent work! 🎉"
                : pct >= 50
                  ? "Good effort! Keep practicing."
                  : "Keep studying and try again!"}
            </p>
            <div className="space-y-2 text-left mb-6">
              {questions.map((q, i) => {
                const correct = selected[q.id] === q.answer;
                return (
                  <div
                    key={q.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border",
                      correct
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    )}
                  >
                    {correct ? (
                      <CheckCircle
                        size={15}
                        className="text-emerald-400 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        size={15}
                        className="text-red-400 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <p className="text-sm text-white font-medium">
                        Q{i + 1}: {q.question}
                      </p>
                      {!correct && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Correct:{" "}
                          <span className="text-emerald-400">
                            {q.answer}.{" "}
                            {q.options.find((o) => o.label === q.answer)?.text}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              <RefreshCw size={15} aria-hidden="true" /> New Quiz
            </button>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  /* ── QUIZ ── */
  if (stage === "quiz" && q) {
    const userAnswer = selected[q.id];
    return (
      <PageLayout
        breadcrumb={[{ label: "AI Tools", highlight: true }, { label: "MCQ Quiz" }]}
        title="MCQ Quiz"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              <span className="text-white font-semibold">{current + 1}</span> /{" "}
              {questions.length}
            </span>
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              ✕ Exit
            </button>
          </div>
        }
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden"
            role="progressbar"
            aria-valuenow={current + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
            aria-label={`Question ${current + 1} of ${questions.length}`}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#111320] border border-white/8 rounded-2xl p-6"
          >
            <p className="text-base font-semibold text-white mb-6 leading-relaxed">
              {q.question}
            </p>
            <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
              {q.options.map((opt) => {
                const isSelected = userAnswer === opt.label;
                const isCorrect = opt.label === q.answer;
                const isWrong = isSelected && !isCorrect;
                const shown = !!userAnswer;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelect(q.id, opt.label)}
                    disabled={!!userAnswer}
                    role="radio"
                    aria-checked={isSelected}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                      !shown &&
                        "border-white/8 bg-white/[0.02] hover:bg-white/5 hover:border-purple-500/30",
                      shown &&
                        isCorrect &&
                        "border-emerald-500/50 bg-emerald-500/10",
                      shown && isWrong && "border-red-500/50 bg-red-500/10",
                      shown &&
                        !isSelected &&
                        !isCorrect &&
                        "border-white/5 opacity-40"
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        !shown && "bg-white/8 text-gray-300",
                        shown && isCorrect && "bg-emerald-500 text-white",
                        shown && isWrong && "bg-red-500 text-white",
                        shown &&
                          !isSelected &&
                          !isCorrect &&
                          "bg-white/5 text-gray-500"
                      )}
                    >
                      {opt.label}
                    </span>
                    <span
                      className={cn(
                        "text-sm flex-1",
                        shown && isCorrect
                          ? "text-emerald-300 font-medium"
                          : shown && isWrong
                            ? "text-red-300"
                            : "text-gray-300"
                      )}
                    >
                      {opt.text}
                    </span>
                    {shown && isCorrect && (
                      <CheckCircle
                        size={15}
                        className="text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {shown && isWrong && (
                      <XCircle
                        size={15}
                        className="text-red-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {showExplanation && userAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-4 p-4 rounded-xl text-sm leading-relaxed border",
                    userAnswer === q.answer
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  )}
                  role="alert"
                >
                  <span className="font-semibold">Explanation: </span>
                  {q.explanation}
                </motion.div>
              )}
            </AnimatePresence>
            {userAnswer && (
              <button
                onClick={next}
                className="mt-5 w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {current < questions.length - 1
                  ? "Next Question →"
                  : "See Results"}
              </button>
            )}
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  /* ── SETUP ── */
  return (
    <PageLayout
      breadcrumb={[{ label: "AI Tools", highlight: true }, { label: "MCQ Quiz" }]}
      title="MCQ Quiz"
      description="Generate multiple-choice questions from any document."
      actions={<ModelSelector value={model} onChange={setModel} />}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#111320] border border-white/8 rounded-2xl p-6 space-y-5">
          {/* Input mode */}
          <div className="flex rounded-xl bg-white/5 border border-white/8 p-1 gap-1" role="tablist" aria-label="Input mode">
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
              placeholder="Paste document content here..."
              rows={7}
              aria-label="Document text for quiz generation"
              className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 resize-none scrollbar-thin"
            />
          )}

          {hasContent && (
            <p className="text-xs text-gray-400">
              {activeText.length.toLocaleString()} characters ready
            </p>
          )}

          {genError && (
            <ErrorBanner message={genError} onRetry={generateQuiz} />
          )}

          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">
              Number of questions
            </p>
            <div className="flex gap-2" role="radiogroup" aria-label="Number of questions">
              {[3, 5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  role="radio"
                  aria-checked={numQuestions === n}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all",
                    numQuestions === n
                      ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                      : "border-white/8 bg-white/[0.02] text-gray-400 hover:border-white/15"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuiz}
            disabled={loading || !hasContent || fileExtract.extracting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Brain size={16} aria-hidden="true" />
            )}
            {loading
              ? "Generating Quiz..."
              : fileExtract.extracting
                ? "Extracting file..."
                : "Generate Quiz"}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
