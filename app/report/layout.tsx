import { DashboardShell } from "@/components/dashboard-shell";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
