"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

const COLORS = [
  { bg: "bg-purple-500/20 border-purple-500/30 text-purple-300", dot: "bg-purple-400" },
  { bg: "bg-blue-500/20 border-blue-500/30 text-blue-300", dot: "bg-blue-400" },
  { bg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300", dot: "bg-emerald-400" },
  { bg: "bg-amber-500/20 border-amber-500/30 text-amber-300", dot: "bg-amber-400" },
  { bg: "bg-rose-500/20 border-rose-500/30 text-rose-300", dot: "bg-rose-400" },
  { bg: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300", dot: "bg-cyan-400" },
];

interface Event {
  id: string;
  title: string;
  day: number;
  startHour: number;
  duration: number; // in hours
  colorIndex: number;
}

const DEFAULT_EVENTS: Event[] = [
  { id: "1", title: "Mathematics", day: 0, startHour: 9, duration: 2, colorIndex: 0 },
  { id: "2", title: "Physics Lab", day: 1, startHour: 10, duration: 3, colorIndex: 1 },
  { id: "3", title: "English Lit", day: 2, startHour: 8, duration: 1, colorIndex: 2 },
  { id: "4", title: "Study Break", day: 2, startHour: 13, duration: 1, colorIndex: 3 },
  { id: "5", title: "Chemistry", day: 3, startHour: 11, duration: 2, colorIndex: 4 },
  { id: "6", title: "History", day: 4, startHour: 9, duration: 1, colorIndex: 5 },
  { id: "7", title: "Group Study", day: 5, startHour: 14, duration: 2, colorIndex: 0 },
];

function formatHour(h: number) {
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

export default function TimetablePage() {
  const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", day: 0, startHour: 9, duration: 1, colorIndex: 0 });
  const [weekOffset, setWeekOffset] = useState(0);

  const addEvent = () => {
    if (!form.title.trim()) return;
    setEvents((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    setShowForm(false);
    setForm({ title: "", day: 0, startHour: 9, duration: 1, colorIndex: 0 });
  };

  const removeEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  // Get current week dates
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const weekDates = DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const isToday = (date: Date) => {
    const t = new Date();
    return date.toDateString() === t.toDateString();
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 uppercase tracking-widest font-medium">
            <span className="text-purple-400">AI TOOLS</span><span>/</span><span>TIMETABLE</span>
          </div>
          <h1 className="text-3xl font-black text-white">Weekly Timetable</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl overflow-hidden">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 hover:bg-white/8 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">
              {weekOffset === 0 ? "This week" : weekOffset < 0 ? `${Math.abs(weekOffset)}w ago` : `In ${weekOffset}w`}
            </button>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 hover:bg-white/8 text-gray-400 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            <Plus size={15} /> Add Event
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-px mb-1">
            <div className="w-16" />
            {DAYS.map((day, i) => (
              <div key={day} className={cn("text-center py-2 rounded-lg", isToday(weekDates[i]) && "bg-purple-500/10")}>
                <p className={cn("text-xs font-medium uppercase tracking-wider", isToday(weekDates[i]) ? "text-purple-300" : "text-gray-500")}>
                  {SHORT_DAYS[i]}
                </p>
                <p className={cn("text-lg font-bold mt-0.5", isToday(weekDates[i]) ? "text-white" : "text-gray-300")}>
                  {weekDates[i].getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-px min-h-[56px]">
                <div className="text-right pr-3 pt-1">
                  <span className="text-xs text-gray-600">{formatHour(hour)}</span>
                </div>
                {DAYS.map((_, dayIdx) => {
                  const slotEvents = events.filter(
                    (e) => e.day === dayIdx && e.startHour === hour
                  );
                  return (
                    <div key={dayIdx} className="relative border-t border-white/5 min-h-[56px]">
                      {slotEvents.map((ev) => {
                        const color = COLORS[ev.colorIndex % COLORS.length];
                        return (
                          <div
                            key={ev.id}
                            className={cn("absolute left-0.5 right-0.5 rounded-lg border px-2 py-1 group cursor-pointer z-10", color.bg)}
                            style={{ height: `${ev.duration * 56 - 4}px`, top: 2 }}
                          >
                            <p className="text-xs font-semibold leading-tight line-clamp-1">{ev.title}</p>
                            <p className="text-[10px] opacity-60 mt-0.5">{formatHour(hour)}–{formatHour(hour + ev.duration)}</p>
                            <button
                              onClick={() => removeEvent(ev.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111320] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={18} className="text-purple-400" />
                <h3 className="text-lg font-bold text-white">Add Event</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Mathematics, Study Break..."
                    className="w-full px-4 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Day</label>
                    <select
                      value={form.day}
                      onChange={(e) => setForm({ ...form, day: +e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                    >
                      {DAYS.map((d, i) => <option key={d} value={i} className="bg-[#1a1b2e]">{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Start time</label>
                    <select
                      value={form.startHour}
                      onChange={(e) => setForm({ ...form, startHour: +e.target.value })}
                      className="w-full px-3 py-3 rounded-xl bg-[#0d0f1a] border border-white/8 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                    >
                      {HOURS.map((h) => <option key={h} value={h} className="bg-[#1a1b2e]">{formatHour(h)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</label>
                  <div className="flex gap-2">
                    {[1, 1.5, 2, 3].map((d) => (
                      <button key={d} onClick={() => setForm({ ...form, duration: d })}
                        className={cn("flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                          form.duration === d ? "border-purple-500/50 bg-purple-500/10 text-purple-300" : "border-white/8 text-gray-400 hover:border-white/15")}>
                        {d}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map((c, i) => (
                      <button key={i} onClick={() => setForm({ ...form, colorIndex: i })}
                        className={cn("w-7 h-7 rounded-full border-2 transition-all", c.dot, form.colorIndex === i ? "border-white scale-110" : "border-transparent")}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-white/8 text-sm text-gray-400 hover:text-white hover:border-white/15 transition-colors">
                  Cancel
                </button>
                <button onClick={addEvent} disabled={!form.title.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition-all">
                  Add Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
