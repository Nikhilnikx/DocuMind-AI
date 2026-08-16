import { Sidebar } from "@/components/sidebar";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0a0c16] overflow-hidden">
      <Sidebar user={{ name: "nikhil" }} chatCount={3} />
      <main className="flex-1 overflow-auto scrollbar-thin">{children}</main>
    </div>
  );
}
