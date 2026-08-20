"use client";

import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { name?: string; email?: string };
  chatCount?: number;
}

/**
 * @deprecated Use DashboardShell instead. This component is kept for
 * backward compatibility but should not be used in new code.
 */
export function DashboardLayout({ children, user, chatCount }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#0a0c16] overflow-hidden">
      <Sidebar user={user} chatCount={chatCount} />
      <main className="flex-1 overflow-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
