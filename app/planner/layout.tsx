import { DashboardShell } from "@/components/dashboard-shell";

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
