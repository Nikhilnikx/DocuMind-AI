import { DashboardShell } from "@/components/dashboard-shell";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
