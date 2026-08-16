"use client";

import { useState } from "react";
import { FileText, Copy, Check, Loader2, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { FileDropZone } from "@/components/file-dropzone";
import { useFileExtract } from "@/hooks/use-file-extract";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/ai";

type InputMode = "paste" | "upload";
type SummaryLength = "brief" | "detailed" | "bullet";

export default function SummarizePage() {
  const [mode, setMode] = useState<InputMode>("paste");
  const [pastedText, setPastedText] = useState("");
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [length, setLength] = useState<SummaryLength>("detailed");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileExtract = useFileExtract();

  // The actual content to summarize
  const activeText = mode === "paste" ? pastedText : fileExtract.text;
  const hasContent = activeText.trim().length > 0;

  const handleSummarize = async () => {
    if (!hasContent) return;
    setLoading(true);
    setSummary("");
    setError("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: activeText, model, length }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Summarization failed.");
      } else {
        setSummary(data.summary ?? "");
      }
    } catch {
      setError("Could not connect to AI service. Check your API key in .env.local.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSummary("");
    setPastedText("");
    fileExtract.reset();
    setError("");
  };

  const lengthOptions: { value: SummaryLength; label: string; desc: string }[] = [
    { value: "brief", label: "Brief", desc: "2-3 sentences" },
    { value: "detailed", label: "Detailed", desc: "Full breakdown" },
    { value: "bullet", label: "Bullet points", desc: "Key points only" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-widest font-medium">
          <span className="text-purple-400">AI TOOLS</span>
          <span>/</span>
          <span>SUMMARIZE</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">Summarize</h1>
            <p className="text-gray-400">Turn any document into a clear, concise summary.</p>
          </div>
          <ModelSelector value={model} onChange={setModel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input side */}
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-white/5 border border-white/8 p-1 gap-1">
            {(["paste", "upload"] as InputMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                  mode === m ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-gray-200"
                )}
              >
                {m === "paste" ? "Paste Text" : "Upload File"}
              </button>
            ))}
          </div>

          {mode === "paste" ? (
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your document text here..."
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-[#111320] border border-white/8 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50 resize-none scrollbar-thin"
            />
          ) : (
            <FileDropZone extract={fileExtract} />
          )}

          {/* Show char count hint */}
          {hasContent && (
            <p className="text-xs text-gray-500">
              {activeText.length.toLocaleString()} characters ready to summarize
            </p>
          )}

          {/* Summary length */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Summary length</p>
            <div className="grid grid-cols-3 gap-2">
              {lengthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLength(opt.value)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    length === opt.value
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/8 bg-white/[0.02] hover:border-white/15"
                  )}
                >
                  <p className={cn("text-sm font-medium", length === opt.value ? "text-purple-300" : "text-white")}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSummarize}
            disabled={loading || !hasContent || fileExtract.extracting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Summarizing..." : fileExtract.extracting ? "Extracting file..." : "Generate Summary"}
          </button>
        </div>

        {/* Output side */}
        <div className="bg-[#111320] border border-white/8 rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-purple-400" />
              <span className="text-sm font-semibold text-white">Summary</span>
              {fileExtract.fileName && !loading && summary && (
                <span className="text-xs text-gray-500 truncate max-w-[140px]">· {fileExtract.fileName}</span>
              )}
            </div>
            {summary && (
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors" title="Reset">
                  <RefreshCw size={13} />
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs text-gray-300 hover:bg-white/8 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-auto scrollbar-thin">
            {error && (
              <div className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[100, 80, 90, 70, 85, 60, 75, 50].map((w, i) => (
                  <div key={i} className="h-3 rounded-full bg-white/5" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : summary ? (
              <div className="space-y-1">
                {summary.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return (
                    <h2 key={i} className="text-lg font-bold text-white mt-1 mb-2">{line.replace(/^##\s*/, "")}</h2>
                  );
                  if (line.startsWith("### ")) return (
                    <h3 key={i} className="text-sm font-semibold text-purple-300 mt-4 mb-1.5">{line.replace(/^###\s*/, "")}</h3>
                  );
                  if (line.startsWith("**") && line.endsWith("**")) return (
                    <p key={i} className="text-sm font-semibold text-white">{line.replace(/\*\*/g, "")}</p>
                  );
                  if (line.startsWith("- ")) return (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed ml-3 list-disc">
                      {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
                    </li>
                  );
                  if (/^\d+\./.test(line)) return (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed ml-3 list-decimal">
                      {line.replace(/^\d+\.\s/, "")}
                    </li>
                  );
                  if (line.trim() === "") return <div key={i} className="h-2" />;
                  return (
                    <p key={i} className="text-sm text-gray-300 leading-relaxed">
                      {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Sparkles size={32} className="text-purple-500/30 mb-3" />
                <p className="text-gray-600 text-sm">Your summary will appear here</p>
                <p className="text-gray-700 text-xs mt-1">
                  {mode === "upload" ? "Upload a document" : "Paste text"} and click Generate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
