"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIModel } from "@/lib/ai";

const models: { value: AIModel; label: string; provider: "openai" | "gemini"; desc: string }[] = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai", desc: "Fast & affordable" },
  { value: "gpt-4o", label: "GPT-4o", provider: "openai", desc: "Most capable" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "gemini", desc: "Fast & efficient" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "gemini", desc: "Most capable" },
];

interface ModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
  className?: string;
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = models.find((m) => m.value === value) ?? models[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/8 transition-colors text-sm"
      >
        {current.provider === "openai" ? (
          <Bot size={13} className="text-emerald-400" />
        ) : (
          <Sparkles size={13} className="text-blue-400" />
        )}
        <span className="text-gray-300 font-medium">{current.label}</span>
        <ChevronDown size={12} className={cn("text-gray-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-56 rounded-xl border border-white/10 bg-[#1a1b2e] shadow-2xl overflow-hidden">
          {/* OpenAI group */}
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Bot size={10} className="text-emerald-400" /> ChatGPT
            </p>
          </div>
          {models.filter((m) => m.provider === "openai").map((m) => (
            <button
              key={m.value}
              onClick={() => { onChange(m.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors",
                value === m.value && "bg-purple-500/10"
              )}
            >
              <span className={cn("font-medium", value === m.value ? "text-purple-300" : "text-gray-300")}>
                {m.label}
              </span>
              <span className="text-xs text-gray-500">{m.desc}</span>
            </button>
          ))}

          {/* Gemini group */}
          <div className="px-3 pt-2.5 pb-1 border-t border-white/5 mt-1">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={10} className="text-blue-400" /> Gemini
            </p>
          </div>
          {models.filter((m) => m.provider === "gemini").map((m) => (
            <button
              key={m.value}
              onClick={() => { onChange(m.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 mb-1 text-sm hover:bg-white/5 transition-colors",
                value === m.value && "bg-blue-500/10"
              )}
            >
              <span className={cn("font-medium", value === m.value ? "text-blue-300" : "text-gray-300")}>
                {m.label}
              </span>
              <span className="text-xs text-gray-500">{m.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
