"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { icon: 16, text: "text-base" },
    md: { icon: 20, text: "text-xl" },
    lg: { icon: 28, text: "text-3xl" },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25"
        style={{ width: sizes[size].icon * 2, height: sizes[size].icon * 2 }}>
        <Sparkles size={sizes[size].icon} className="text-white" />
      </div>
      <span className={cn("font-bold tracking-tight", sizes[size].text)}>
        <span className="text-white">Docu</span>
        <span className="text-purple-400">Mind</span>
      </span>
    </div>
  );
}
