"use client";

import { Sidebar } from "@/components/sidebar";
import { useAppStore } from "@/lib/store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { name?: string; email?: string };
  chatCount?: number;
}

export function DashboardLayout({ children, user, chatCount }: DashboardLayoutProps) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-[#0a0c16] overflow-hidden">
      <Sidebar user={user} chatCount={chatCount} />
      <main className="flex-1 overflow-auto scrollbar-thin">
        {children}
      </main>
    </div>
  );
}
