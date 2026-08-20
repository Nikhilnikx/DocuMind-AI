"use client";

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Calendar,
  Target,
  GripVertical,
} from "lucide-react";
import { ModelSelector } from "@/components/model-selector";
import { PageLayout } from "@/components/page-layout";
import { ConfirmDialog } from "@/components/confirm-dialog";
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
  {
    id: "1",
    title: "Review Chapter 5 – Calculus",
    subject: "Mathematics",
    deadline: "2026-08-18",
    priority: "high",
    status: "todo",
    estimatedHours: 2,
  },
  {
    id: "2",
    title: "Complete Lab Report",
    subject: "Physics",
    deadline: "2026-08-19",
    priority: "high",
    status: "in-progress",
    estimatedHours: 3,
  },
  {
    id: "3",
    title: "Read Essay Prompt",
    subject: "English",
    deadline: "2026-08-20",
    priority: "medium",
    status: "done",
    estimatedHours: 0.5,
  },
  {
    id: "4",
    title: "Memorise Periodic Table",
    subject: "Chemistry",
    deadline: "2026-08-21",
    priority: "medium",
    status: "todo",
    estimatedHours: 1.5,
  },
  {
    id: "5",
    title: "Practice Past Papers",
    subject: "History",
    deadline: "2026-08-22",
    priority: "low",
    status: "todo",
    estimatedHours: 2,
  },
];

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Other",
];

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

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [model, setModel] = useState<AIModel>("gpt-4o-mini");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Task, "id">>({
    title: "",
    subject: "Mathematics",
    deadline: "",
    priority: "medium",
    status: "todo",
    estimatedHours: 1,
  });
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks((prev) => [{ ...form, id: Date.now().toString() }, ...prev]);
    setShowForm(false);
    setForm({
      title: "",
      subject: "Mathematics",
      deadline: "",
      priority: "medium",
      status: "todo",
      estimatedHours: 1,
    });
  };

  const updateStatus = (id: string, status: Status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const totalHours = tasks
    .filter((t) => t.status !== "done")
    .reduce((sum, t) => sum + t.estimatedHours, 0);
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <PageLayout
      breadcrumb={[{ label: "AI Tools", highlight: true }, { label: "Study Planner" }]}
      title="Study Planner"
      description="Organise tasks and get AI-powered study suggestions."
      actions={
        <>
          <ModelSelector value={model} onChange={setModel} />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Plus size={15} aria-hidden="true" /> Add Task
          </button>
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total tasks",
            value: tasks.length,
            icon: ClipboardList,
            color: "text-purple-400",
          },
          {
            label: "In progress",
            value: tasks.filter((t) => t.status === "in-progress").length,
            icon: Target,
            color: "text-blue-400",
          },
          {
            label: "Completed",
            value: doneCount,
            icon: CheckCircle,
            color: "text-emerald-400",
          },
          {
            label: "Hours left",
            value: `${totalHours}h`,
            icon: Calendar,
            color: "text-amber-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111320] border border-white/8 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} aria-hidden="true" />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1 mb-4 w-fit"
        role="tablist"
        aria-label="Task filter"
      >
        {[{ id: "all" as const, label: "All" }, ...STATUS_COLUMNS].map(
          (f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              role="tab"
              aria-selected={filter === f.id}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                filter === f.id
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              {f.label}
            </button>
          )
        )}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <ClipboardList
                size={32}
                className="mx-auto mb-3 opacity-30"
                aria-hidden="true"
              />
              <p>No tasks here. Add one above!</p>
            </div>
          ) : (
            filteredTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-4 bg-[#111320] border border-white/8 rounded-xl group hover:border-white/12 transition-colors"
              >
                <GripVertical
                  size={14}
                  className="text-gray-700 cursor-grab shrink-0"
                  aria-hidden="true"
                />

                <button
                  onClick={() =>
                    updateStatus(
                      task.id,
                      task.status === "done" ? "todo" : "done"
                    )
                  }
                  className="shrink-0"
                  aria-label={
                    task.status === "done"
                      ? `Mark "${task.title}" as incomplete`
                      : `Mark "${task.title}" as complete`
                  }
                >
                  {task.status === "done" ? (
                    <CheckCircle
                      size={18}
                      className="text-emerald-400"
                    />
                  ) : (
                    <Circle
                      size={18}
                      className="text-gray-500 hover:text-purple-400 transition-colors"
                    />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      task.status === "done"
                        ? "line-through text-gray-500"
                        : "text-white"
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {task.subject}
                    </span>
                    {task.deadline && (
                      <span className="text-xs text-gray-500">
                        · Due{" "}
                        {new Date(task.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      · {task.estimatedHours}h
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-1 rounded-full border capitalize",
                    PRIORITY_STYLES[task.priority]
                  )}
                >
                  {task.priority}
                </span>

                <select
                  value={task.status}
                  onChange={(e) =>
                    updateStatus(task.id, e.target.value as Status)
                  }
                  className="text-xs bg-white/5 border border-white/8 rounded-lg px-2 py-1.5 text-gray-400 focus:outline-none cursor-pointer"
                  aria-label={`Status for ${task.title}`}
                >
                  {STATUS_COLUMNS.map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                      className="bg-[#1a1b2e]"
                    >
                      {s.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setDeleteTarget(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  aria-label={`Delete task "${task.title}"`}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowForm(false)
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111320] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3
                id="add-task-title"
                className="text-lg font-bold text-white mb-5"
              >
                Add Study Task
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="task-title"
                    className="text-xs text-gray-400 uppercase tracking-wider font-medium"
                  >
                    Task title
                  </label>
                  <input
                    id="task-title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Review Chapter 5"
                    className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="task-subject"
                      className="text-xs text-gray-400 uppercase tracking-wider font-medium"
                    >
                      Subject
                    </label>
                    <select
                      id="task-subject"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} className="bg-[#1a1b2e]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="task-deadline"
                      className="text-xs text-gray-400 uppercase tracking-wider font-medium"
                    >
                      Deadline
                    </label>
                    <input
                      id="task-deadline"
                      type="date"
                      value={form.deadline}
                      onChange={(e) =>
                        setForm({ ...form, deadline: e.target.value })
                      }
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                      Priority
                    </p>
                    <div className="flex gap-1" role="radiogroup" aria-label="Task priority">
                      {(["high", "medium", "low"] as Priority[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => setForm({ ...form, priority: p })}
                          role="radio"
                          aria-checked={form.priority === p}
                          className={cn(
                            "flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize",
                            form.priority === p
                              ? PRIORITY_STYLES[p]
                              : "border-white/8 text-gray-400 hover:border-white/15"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="task-hours"
                      className="text-xs text-gray-400 uppercase tracking-wider font-medium"
                    >
                      Est. hours
                    </label>
                    <input
                      id="task-hours"
                      type="number"
                      min={0.5}
                      max={8}
                      step={0.5}
                      value={form.estimatedHours}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          estimatedHours: +e.target.value,
                        })
                      }
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/8 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  disabled={!form.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition-all"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) {
            setTasks((prev) => prev.filter((t) => t.id !== deleteTarget));
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}
