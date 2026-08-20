import { DashboardShell } from "@/components/dashboard-shell";

export default function ExamPrepLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
