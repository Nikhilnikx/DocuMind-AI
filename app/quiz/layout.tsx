import { DashboardShell } from "@/components/dashboard-shell";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
