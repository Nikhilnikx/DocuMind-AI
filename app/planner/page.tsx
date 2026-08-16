"use client";

import { useState } from "react";
import {
  ClipboardList, Plus, Trash2, CheckCircle, Circle, Sparkles,
  Loader2, Calendar, Target, ChevronDown, GripVertical
} from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/ai";
import { motion, AnimatePresence } from "framer-motion";

type Priority = "high" | "medium" | "low";
type Status = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  priority: Priority;
  status: Status;
  estimatedHours: number;
}

const DEMO_TASKS: Task[] = [
  { id: "1", title: "Review Chapter 5 – Calculus", subject: "Mathematics", deadline: "2026-08-18", priority: "high", status: "todo", estimatedHours: 2 },
  { id: "2", title: "Complete Lab Report", subject: "Physics", deadline: "2026-08-19", priority: "high", status: "in-progress", estimatedHours: 3 },
  { id: "3", title: "Read Essay Prompt", subject: "English", deadline: "2026-08-20", priority: "medium", status: "done", estimatedHours: 0.5 },
  { id: "4", title: "Memorise Periodic Table", subject: "Chemistry", deadline: "2026-08-21", priority: "medium", status: "todo", estimatedHours: 1.5 },
  { id: "5", title: "Practice Past Papers", subject: "History", deadline: "2026-08-22", priority: "low", status: "todo", estimatedHours: 2 },
];

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Computer Science", "Economics", "Other"];

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const STATUS_COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "text-gray-400" },
  { id: "in-progress", label: "In Progress", color: "text-blue-400" },
  { id: "done", label: "Done", color: "text-emerald-400" },
];

const AI_SUGGESTIONS = [
  "📚 Start with high-priority tasks that have nearest deadlines — Calculus review and Physics Lab Report should come first.",
  "⏰ Schedule 2-hour deep work blocks in the morning when your concentration is highest.",
  "🔄 Use the Pomodoro technique: 25 minutes focus, 5 minute break. Repeat 4 times then take a 20-minute break.",
  "📅 Your Chemistry memorization task is best done in short 15-minute review sessions spread across 3 days.",
  "✅ You have 8.5 hours of estimated work across 5 tasks. Spread them across 3 days for optimal retention.",
];

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Task, "id">>({ title: "", subject: "Mathematics", deadline: "", priority: "medium", status: "todo", estimatedHours: 1 });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState<"all" | Status>("all");

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks((prev) => [{ ...form, id: Date.now().toString() }, ...prev]);
    setShowForm(false);
    setForm({ title: "", subject: "Mathematics", deadline: "", priority: "medium", status: "todo", estimatedHours: 1 });
  };

  const updateStatus = (id: string, status: Status) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const getAISuggestions = async () => {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAiSuggestions(AI_SUGGESTIONS);
    setShowSuggestions(true);
    setAiLoading(false);
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const totalHours = tasks.filter((t) => t.status !== "done").reduce((sum, t) => sum + t.estimatedHours, 0);
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-widest font-medium">
          <span className="text-purple-400">AI TOOLS</span><span>/</span><span>STUDY PLANNER</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">Study Planner</h1>
            <p className="text-gray-400">Organise tasks and get AI-powered study suggestions.</p>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector value={model} onChange={setModel} />
            <button
              onClick={getAISuggestions}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 text-sm text-gray-300 transition-colors"
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-purple-400" />}
              AI Suggestions
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              <Plus size={15} /> Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total tasks", value: tasks.length, icon: ClipboardList, color: "text-purple-400" },
          { label: "In progress", value: tasks.filter((t) => t.status === "in-progress").length, icon: Target, color: "text-blue-400" },
          { label: "Completed", value: doneCount, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Hours left", value: `${totalHours}h`, icon: Calendar, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111320] border border-white/8 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && aiSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-purple-900/20 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-purple-400" />
                <span className="text-sm font-semibold text-white">AI Study Plan</span>
              </div>
              <button onClick={() => setShowSuggestions(false)} className="text-xs text-gray-500 hover:text-gray-300">Dismiss</button>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((s, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="text-sm text-gray-300 leading-relaxed">{s}</motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1 mb-4 w-fit">
        {[{ id: "all" as const, label: "All" }, ...STATUS_COLUMNS].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              filter === f.id ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-gray-200")}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
              <p>No tasks here. Add one above!</p>
            </div>
          ) : filteredTasks.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-4 bg-[#111320] border border-white/8 rounded-xl group hover:border-white/12 transition-colors">
              <GripVertical size={14} className="text-gray-700 cursor-grab shrink-0" />

              <button onClick={() => updateStatus(task.id, task.status === "done" ? "todo" : "done")} className="shrink-0">
                {task.status === "done"
                  ? <CheckCircle size={18} className="text-emerald-400" />
                  : <Circle size={18} className="text-gray-600 hover:text-purple-400 transition-colors" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.status === "done" ? "line-through text-gray-500" : "text-white")}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{task.subject}</span>
                  {task.deadline && <span className="text-xs text-gray-600">· Due {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                  <span className="text-xs text-gray-600">· {task.estimatedHours}h</span>
                </div>
              </div>

              <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full border capitalize", PRIORITY_STYLES[task.priority])}>
                {task.priority}
              </span>

              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value as Status)}
                className="text-xs bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-gray-400 focus:outline-none cursor-pointer"
              >
                {STATUS_COLUMNS.map((s) => <option key={s.id} value={s.id} className="bg-[#1a1b2e]">{s.label}</option>)}
              </select>

              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111320] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-5">Add Study Task</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Task title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Review Chapter 5"
                    className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Subject</label>
                    <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none appearance-none cursor-pointer">
                      {SUBJECTS.map((s) => <option key={s} className="bg-[#1a1b2e]">{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Deadline</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50 [color-scheme:dark]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Priority</label>
                    <div className="flex gap-1">
                      {(["high", "medium", "low"] as Priority[]).map((p) => (
                        <button key={p} onClick={() => setForm({ ...form, priority: p })}
                          className={cn("flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize",
                            form.priority === p ? PRIORITY_STYLES[p] : "border-white/8 text-gray-500 hover:border-white/15")}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Est. hours</label>
                    <input type="number" min={0.5} max={8} step={0.5} value={form.estimatedHours}
                      onChange={(e) => setForm({ ...form, estimatedHours: +e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/8 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={addTask} disabled={!form.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition-all">
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
