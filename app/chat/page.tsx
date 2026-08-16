"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, MoreHorizontal, ChevronDown, ChevronRight, Send,
  Paperclip, FileText, Sparkles, Plus, Trash2, Pencil, X,
  Upload, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ModelSelector } from "@/components/model-selector";
import { FileIcon, getFileType } from "@/components/file-icon";
import { useFileExtract } from "@/hooks/use-file-extract";
import { chatHistory, type ChatSession, type ChatMessage } from "@/lib/chat-history";
import type { AIModel } from "@/lib/ai";

/* ─── Source card ───────────────────────────────────────────────── */
function SourceCard({ source, index }: { source: { doc: string; page: number; snippet: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-gray-500 shrink-0" />
          <span className="text-xs font-medium text-gray-300">{source.doc} · p.{source.page}</span>
        </div>
        <ChevronRight size={12} className={cn("text-gray-600 transition-transform", open && "rotate-90")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden">
            <p className="px-4 pb-3 text-xs text-gray-500 leading-relaxed">{source.snippet}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Message bubble ────────────────────────────────────────────── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const isAssistant = message.role === "assistant";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", !isAssistant && "flex-row-reverse")}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={14} className="text-white" />
        </div>
      )}
      <div className={cn("flex-1 max-w-[85%]", !isAssistant && "flex flex-col items-end")}>
        {isAssistant && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-white">DocuMind</span>
            <span className="text-xs text-gray-600">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
        <div className={cn("rounded-2xl px-4 py-3",
          isAssistant ? "text-gray-200" : "bg-[#1e1f2e] rounded-tr-sm text-gray-200")}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 w-full">
            <button onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-1.5">
              <FileText size={12} /> Sources
              <span className="bg-white/8 rounded-full px-1.5 py-0.5 text-gray-400">{message.sources.length}</span>
              <ChevronDown size={11} className={cn("transition-transform", sourcesOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {sourcesOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                  {message.sources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [search, setSearch] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileExtract = useFileExtract();

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSessions(chatHistory.getAll());
  }, []);

  // Refresh session list helper
  const refreshSessions = useCallback(() => setSessions(chatHistory.getAll()), []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    const s = chatHistory.get(activeId);
    setMessages(s?.messages ?? []);
  }, [activeId]);

  // When file extracted, attach to current session
  useEffect(() => {
    if (!fileExtract.text || !activeId) return;
    chatHistory.updateDocument(activeId, fileExtract.fileName, fileExtract.text);
    refreshSessions();
    setShowUploadPanel(false);
  }, [fileExtract.text, activeId, refreshSessions]);

  const createNewChat = () => {
    const s = chatHistory.create({ model });
    refreshSessions();
    setActiveId(s.id);
    setMessages([]);
    fileExtract.reset();
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    chatHistory.delete(id);
    refreshSessions();
    if (activeId === id) { setActiveId(null); setMessages([]); }
  };

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameId(s.id);
    setRenameVal(s.title);
  };

  const commitRename = () => {
    if (renameId && renameVal.trim()) {
      chatHistory.rename(renameId, renameVal.trim());
      refreshSessions();
    }
    setRenameId(null);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!activeId) {
      const s = chatHistory.create({ model });
      refreshSessions();
      setActiveId(s.id);
    }

    const sessionId = activeId ?? chatHistory.getAll()[0]?.id;
    if (!sessionId) return;

    const userMsg = chatHistory.addMessage(sessionId, { role: "user", content: input.trim() });
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const session = chatHistory.get(sessionId);
      const contextText = session?.documentText ?? "";
      const historyMsgs = (session?.messages ?? []).slice(-12).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          model,
          documentContext: contextText,
          chatHistory: historyMsgs,
        }),
      });
      const data = await res.json();
      const aiContent = data.message?.content ?? "Sorry, I could not generate a response.";
      const aiMsg = chatHistory.addMessage(sessionId, {
        role: "assistant",
        content: aiContent,
        sources: data.message?.sources ?? [],
      });
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg = chatHistory.addMessage(sessionId, {
        role: "assistant",
        content: "Connection error. Please check your API key in .env.local.",
      });
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      refreshSessions();
    }
  };

  const activeSession = sessions.find((s) => s.id === activeId);
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── Thread sidebar ───────────────────────────────────────── */}
      <div className="w-64 border-r border-white/5 flex flex-col bg-[#0d0f1a] shrink-0">
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
            <Search size={13} className="text-gray-500 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none flex-1 min-w-0" />
          </div>
          <button onClick={createNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-sm text-purple-300 font-medium transition-colors">
            <Plus size={14} /> New chat
          </button>
        </div>

        <div className="flex-1 px-2 py-1 space-y-0.5 overflow-auto scrollbar-thin">
          {filteredSessions.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-6 px-3">
              {sessions.length === 0 ? "No chats yet. Start one!" : "No results."}
            </p>
          )}
          {filteredSessions.map((s) => (
            <div key={s.id}
              onClick={() => setActiveId(s.id)}
              className={cn("group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors",
                activeId === s.id ? "bg-white/8 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-white/5")}>
              {renameId === s.id ? (
                <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                  onBlur={commitRename} onKeyDown={(e) => e.key === "Enter" && commitRename()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent outline-none text-white text-sm border-b border-purple-500 min-w-0" />
              ) : (
                <>
                  <span className="flex-1 truncate">{s.title}</span>
                  {s.documentName && (
                    <FileIcon type={getFileType(s.documentName)} size="sm" className="w-5 h-5 text-[7px] shrink-0" />
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={(e) => startRename(s, e)}
                      className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300">
                      <Pencil size={11} />
                    </button>
                    <button onClick={(e) => deleteSession(s.id, e)}
                      className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Document context indicator */}
        {activeSession?.documentName && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Context</p>
            <div className="flex items-center gap-2">
              <FileIcon type={getFileType(activeSession.documentName)} size="sm" />
              <p className="text-xs text-gray-300 truncate">{activeSession.documentName}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Main chat ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-5 shadow-xl shadow-purple-500/25">
              <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Ask your documents anything</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              Upload a PDF, Word, Excel, or PowerPoint file — then ask questions, get summaries, or generate quizzes.
            </p>
            <button onClick={createNewChat}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25">
              <Plus size={16} /> Start a new chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-auto scrollbar-thin px-6 py-6 space-y-5">
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-white">DocuMind</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {activeSession?.documentName
                        ? `I've loaded "${activeSession.documentName}". Ask me anything about it!`
                        : "Hey! Upload a document using the 📎 button below, then ask me anything."}
                    </p>
                  </div>
                </div>
              )}
              {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Upload panel */}
            <AnimatePresence>
              {showUploadPanel && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
                  <div className="p-4 bg-[#0d0f1a]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-white">Upload document</p>
                      <button onClick={() => setShowUploadPanel(false)}
                        className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/8 transition-colors">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Dropzone */}
                    <div {...fileExtract.dropzone.getRootProps()}
                      className={cn("border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all text-center",
                        fileExtract.dropzone.isDragActive ? "border-purple-500 bg-purple-500/10"
                        : fileExtract.text ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-white/10 hover:border-purple-500/30 hover:bg-white/[0.02]")}>
                      <input {...fileExtract.dropzone.getInputProps()} />
                      {fileExtract.extracting ? (
                        <div className="space-y-2">
                          <p className="text-sm text-purple-300 font-medium">{fileExtract.progress?.message}</p>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all"
                              style={{ width: `${fileExtract.progress?.percent ?? 0}%` }} />
                          </div>
                        </div>
                      ) : fileExtract.text ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle size={16} className="text-emerald-400" />
                          <span className="text-sm text-emerald-300 font-medium">{fileExtract.fileName}</span>
                          <span className="text-xs text-gray-500">({(fileExtract.charCount / 1000).toFixed(1)}k chars)</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="mx-auto mb-2 text-gray-500" />
                          <p className="text-sm text-gray-400 font-medium">Drop or click to upload</p>
                          <p className="text-xs text-gray-600 mt-0.5">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT</p>
                        </>
                      )}
                    </div>
                    {fileExtract.error && (
                      <p className="text-xs text-red-400 mt-2">{fileExtract.error}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div className="px-4 pb-4 pt-2">
              <div className="rounded-2xl border border-white/10 bg-[#111320] overflow-hidden">
                <textarea value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={activeSession?.documentName
                    ? `Ask about "${activeSession.documentName}"…`
                    : "Ask anything about your documents…"}
                  rows={2}
                  className="w-full px-5 pt-4 pb-2 bg-transparent text-sm text-white placeholder-gray-500 outline-none resize-none scrollbar-thin" />
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5">
                  <button onClick={() => setShowUploadPanel(!showUploadPanel)}
                    className={cn("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                      showUploadPanel || activeSession?.documentName
                        ? "text-purple-300 bg-purple-500/10 border border-purple-500/20"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5")}>
                    <Paperclip size={13} />
                    {activeSession?.documentName ? activeSession.documentName.slice(0, 20) + "…" : "Add document"}
                  </button>
                  <div className="flex items-center gap-2">
                    <ModelSelector value={model} onChange={setModel} />
                    <button onClick={handleSend} disabled={!input.trim() || loading}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all">
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
