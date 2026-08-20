import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "DocuMind – The Thinking Workspace for Your Documents",
  description:
    "DocuMind turns scattered files into clear answers. Upload your knowledge base, ask anything, and move from question to insight in seconds.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0c16] text-white antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
