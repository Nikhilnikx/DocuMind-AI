"use client";

import { useState } from "react";
import {
  FileDown, Loader2, Sparkles, CheckCircle, AlertCircle,
  FileText, Brain, GraduationCap, BarChart3, RefreshCw,
} from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { FileDropZone } from "@/components/file-dropzone";
import { useFileExtract } from "@/hooks/use-file-extract";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";

type ReportSection = "summary" | "keyPoints" | "quiz" | "examPrep" | "insights";

interface ReportData {
  documentName: string;
  generatedAt: string;
  summary: string;
  keyPoints: string[];
  quiz: { question: string; answer: string }[];
  examTopics: { topic: string; importance: string; detail: string }[];
  insights: string[];
}

const SECTION_CONFIG: { id: ReportSection; label: string; icon: React.ReactNode }[] = [
  { id: "summary",   label: "Summary",      icon: <FileText size={14} /> },
  { id: "keyPoints", label: "Key Points",   icon: <CheckCircle size={14} /> },
  { id: "quiz",      label: "Q&A / Quiz",   icon: <Brain size={14} /> },
  { id: "examPrep",  label: "Exam Topics",  icon: <GraduationCap size={14} /> },
  { id: "insights",  label: "Insights",     icon: <BarChart3 size={14} /> },
];

export default function ReportPage() {
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<ReportSection>("summary");
  const [exporting, setExporting] = useState(false);
  const fileExtract = useFileExtract();

  const generateReport = async () => {
    if (!fileExtract.text) return;
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fileExtract.text, fileName: fileExtract.fileName, model }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Report generation failed."); return; }
      setReport(data.report);
      setActiveSection("summary");
    } catch {
      setError("Could not connect to AI. Check your API key in .env.local.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!report) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageW = doc.internal.pageSize.getWidth();
      const margin = 18;
      const maxW = pageW - margin * 2;
      let y = margin;

      const addText = (text: string, fontSize: number, bold = false, color = [30, 30, 30] as [number,number,number]) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxW) as string[];
        if (y + lines.length * (fontSize * 0.4) > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines, margin, y);
        y += lines.length * (fontSize * 0.4) + 2;
      };

      const addSection = (title: string) => {
        y += 4;
        doc.setDrawColor(124, 58, 237);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
        y += 4;
        addText(title, 13, true, [124, 58, 237]);
        y += 1;
      };

      // Cover
      addText("DocuMind Report", 22, true, [124, 58, 237]);
      addText(report.documentName, 14, false, [80, 80, 80]);
      addText(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, 9, false, [120, 120, 120]);
      y += 6;

      // Summary
      addSection("Summary");
      addText(report.summary, 10);

      // Key Points
      addSection("Key Points");
      report.keyPoints.forEach((pt, i) => addText(`${i + 1}. ${pt}`, 10));

      // Q&A
      addSection("Questions & Answers");
      report.quiz.forEach((qa, i) => {
        addText(`Q${i + 1}: ${qa.question}`, 10, true);
        addText(`A: ${qa.answer}`, 10);
        y += 2;
      });

      // Exam Topics
      addSection("Exam Topics");
      report.examTopics.forEach((t) => {
        addText(`• [${t.importance.toUpperCase()}] ${t.topic}`, 10, true);
        addText(`  ${t.detail}`, 9);
        y += 1;
      });

      // Insights
      addSection("Key Insights");
      report.insights.forEach((ins) => addText(`→ ${ins}`, 10));

      doc.save(`DocuMind-Report-${report.documentName.replace(/[^a-z0-9]/gi, "_")}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-widest font-medium">
          <span className="text-purple-400">AI TOOLS</span><span>/</span><span>REPORT</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">Generate Report</h1>
            <p className="text-gray-400">Full document analysis — summary, Q&A, exam prep, and insights in one PDF.</p>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector value={model} onChange={setModel} />
            {report && (
              <button onClick={exportPDF} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-sm text-emerald-300 font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-50">
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                {exporting ? "Exporting…" : "Export PDF"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: upload + generate */}
        <div className="lg:col-span-2 space-y-4">
          <FileDropZone extract={fileExtract} />

          {fileExtract.text && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 text-xs text-gray-400 space-y-1">
              <div className="flex justify-between"><span>File</span><span className="text-white font-medium truncate max-w-[150px]">{fileExtract.fileName}</span></div>
              <div className="flex justify-between"><span>Characters</span><span className="text-white">{fileExtract.charCount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Pages</span><span className="text-white">{fileExtract.pageCount}</span></div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button onClick={generateReport}
            disabled={loading || !fileExtract.text || fileExtract.extracting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? "Generating report…" : fileExtract.extracting ? "Extracting file…" : "Generate Full Report"}
          </button>

          {report && (
            <button onClick={() => { setReport(null); fileExtract.reset(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/8 text-sm text-gray-400 hover:text-white hover:border-white/15 transition-colors">
              <RefreshCw size={13} /> New Report
            </button>
          )}
        </div>

        {/* Right: report viewer */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-[#111320] border border-white/8 rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={18} className="text-purple-400 animate-pulse" />
                <p className="text-sm font-semibold text-white">Analysing document…</p>
              </div>
              {["Generating summary", "Extracting key points", "Creating Q&A pairs", "Identifying exam topics", "Compiling insights"].map((step, i) => (
                <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={12} className="text-purple-400 animate-spin shrink-0" />
                  {step}…
                </motion.div>
              ))}
            </div>
          ) : report ? (
            <div className="bg-[#111320] border border-white/8 rounded-2xl overflow-hidden">
              {/* Section tabs */}
              <div className="flex border-b border-white/5 overflow-x-auto">
                {SECTION_CONFIG.map((sec) => (
                  <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                    className={cn("flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2",
                      activeSection === sec.id
                        ? "border-purple-500 text-purple-300 bg-purple-500/5"
                        : "border-transparent text-gray-500 hover:text-gray-300")}>
                    {sec.icon}{sec.label}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-auto scrollbar-thin max-h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                    {activeSection === "summary" && (
                      <div>
                        <p className="text-xs text-gray-500 mb-3">
                          {report.documentName} · {new Date(report.generatedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{report.summary}</p>
                      </div>
                    )}

                    {activeSection === "keyPoints" && (
                      <ul className="space-y-2.5">
                        {report.keyPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-gray-300 leading-relaxed">{pt}</p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {activeSection === "quiz" && (
                      <div className="space-y-4">
                        {report.quiz.map((qa, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/8">
                            <p className="text-sm font-semibold text-purple-300 mb-2">Q{i + 1}: {qa.question}</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{qa.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === "examPrep" && (
                      <div className="space-y-3">
                        {report.examTopics.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full shrink-0 mt-0.5",
                              t.importance === "high" ? "bg-amber-500/20 text-amber-400"
                              : t.importance === "medium" ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400")}>
                              {t.importance.toUpperCase()}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">{t.topic}</p>
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSection === "insights" && (
                      <ul className="space-y-2.5">
                        {report.insights.map((ins, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="text-purple-400 shrink-0 mt-0.5">→</span>
                            <p className="text-sm text-gray-300 leading-relaxed">{ins}</p>
                          </li>
                        ))}
                      </ul>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="bg-[#111320] border border-white/8 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <Sparkles size={36} className="text-purple-500/30 mb-3" />
              <p className="text-gray-600 text-sm">Upload a document and click</p>
              <p className="text-gray-700 text-xs mt-0.5">"Generate Full Report" to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
