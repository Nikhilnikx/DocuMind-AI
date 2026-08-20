import { DashboardShell } from "@/components/dashboard-shell";

export default function TimetableLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
