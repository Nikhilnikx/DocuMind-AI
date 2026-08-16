"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  FileText,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  Brain,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare, badge: true },
];

const toolsNav = [
  { href: "/summarize", label: "Summarize", icon: FileText },
  { href: "/quiz", label: "MCQ Quiz", icon: Brain },
  { href: "/exam-prep", label: "Exam Prep", icon: GraduationCap },
  { href: "/report", label: "Generate Report", icon: BookOpen },
  { href: "/timetable", label: "Timetable", icon: Calendar },
  { href: "/planner", label: "Study Planner", icon: ClipboardList },
];

const bottomNav = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user?: { name?: string; email?: string };
  chatCount?: number;
}

export function Sidebar({ user, chatCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("documind_session");
    }
    router.push("/auth/signin");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex flex-col h-full w-64 border-r border-white/5 bg-[#0d0f1a] shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Logo size="sm" />
      </div>

      {/* Workspace selector */}
      <div className="px-3 pt-3">
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() ?? "D"}
            </div>
            <span className="text-sm font-medium text-gray-200 truncate max-w-[110px]">
              {user?.name ?? "My workspace"}
            </span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {mainNav.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive(href)
                ? "bg-white/8 text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon size={17} />
              <span>{label}</span>
            </div>
            {badge && chatCount > 0 && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-medium">
                {chatCount}
              </span>
            )}
          </Link>
        ))}

        {/* Tools section */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-1.5">
            AI Tools
          </p>
          {toolsNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive(href)
                  ? "bg-purple-500/15 text-purple-300"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* AI Promo card */}
      <div className="mx-3 mb-2 p-3.5 rounded-xl bg-gradient-to-br from-purple-900/40 to-violet-900/30 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={14} className="text-purple-400" />
          <span className="text-xs font-semibold text-white">Make sense of it all</span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
          Ask your docs anything — powered by ChatGPT or Gemini.
        </p>
        <Link href="/chat" className="text-xs text-purple-300 hover:text-purple-200 font-medium">
          Start a chat →
        </Link>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/5 px-3 pt-2 pb-1 space-y-0.5">
        {bottomNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive(href)
                ? "bg-white/8 text-white"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* User + logout */}
      <div className="border-t border-white/5 p-3 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "N"}
          </div>
          <span className="text-sm text-gray-300 truncate flex-1">
            {user?.name ?? user?.email ?? "User"}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
        >
          <LogOut size={17} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
