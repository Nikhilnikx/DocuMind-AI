"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20",
        className
      )}
      role="alert"
    >
      <AlertCircle
        size={16}
        className="text-red-400 mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-red-300">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-xs text-red-300 font-medium transition-colors shrink-0"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}
