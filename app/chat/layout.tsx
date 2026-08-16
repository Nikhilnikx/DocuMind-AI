import { Sidebar } from "@/components/sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0c16] overflow-hidden">
      <Sidebar user={{ name: "nikhil" }} chatCount={3} />
      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
}
