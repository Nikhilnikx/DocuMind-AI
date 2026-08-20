"use client";

import { cn } from "@/lib/utils";

interface PageLayoutProps {
  breadcrumb: { label: string; highlight?: boolean }[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared page layout used by all AI tool pages.
 * Provides consistent breadcrumb, heading, and action area.
 */
export function PageLayout({
  breadcrumb,
  title,
  description,
  actions,
  children,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn("p-6 md:p-8 max-w-5xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 uppercase tracking-widest font-medium">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              <span className={item.highlight ? "text-purple-400" : ""}>
                {item.label}
              </span>
            </span>
          ))}
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
              {title}
            </h1>
            {description && (
              <p className="text-gray-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
