import { DashboardShell } from "@/components/dashboard-shell";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
