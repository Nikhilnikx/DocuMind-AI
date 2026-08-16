"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Search, FileText, Brain, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Ask anything",
    description:
      "Query your entire document library with natural language. Get precise answers backed by exact source citations.",
    color: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-400",
  },
  {
    icon: FileText,
    title: "Any file format",
    description:
      "Upload PDFs, Word documents, and text files. DocuMind extracts and indexes every word for instant search.",
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Search,
    title: "Source citations",
    description:
      "Every answer shows exactly which document and page it came from. No black boxes, full transparency.",
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Zap,
    title: "Instant insights",
    description:
      "Go from question to insight in seconds. DocuMind processes and returns answers at lightning speed.",
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description:
      "Your documents are encrypted at rest and in transit. Your data never trains our models.",
    color: "from-rose-500/20 to-pink-500/10",
    iconColor: "text-rose-400",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your documents",
    description:
      "Drag and drop PDFs, DOCX, or TXT files. We support up to 50MB per file.",
  },
  {
    number: "02",
    title: "DocuMind reads everything",
    description:
      "Our AI indexes every sentence, building a searchable knowledge graph of your files.",
  },
  {
    number: "03",
    title: "Ask anything, get answers",
    description:
      "Ask questions in plain English. Get clear answers with page-level citations from your docs.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0c16] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center px-6 pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-600/6 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-green-400 uppercase">
                The thinking workspace for your documents
              </span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <span className="text-white">Ask more of your</span>
              <br />
              <span className="text-gradient">documents.</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
              DocuMind turns scattered files into clear answers. Upload your knowledge base,
              ask anything, and move from question to insight in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-purple-500/30 text-base"
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 border border-white/15 hover:border-white/25 text-white font-medium px-7 py-3.5 rounded-xl transition-all duration-200 text-base backdrop-blur-sm"
              >
                Sign in to workspace
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-10">
              <div className="flex -space-x-2">
                {["#8B5CF6", "#A78BFA", "#C4B5FD"].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0a0c16]"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div>
                <div className="text-sm text-gray-300 font-medium">Trusted by thoughtful teams</div>
                <div className="text-xs text-gray-500">4.9/5 from 2,000+ users</div>
              </div>
            </div>
          </motion.div>

          {/* Right – UI mock */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl border border-white/10 bg-[#111320] shadow-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <span className="text-xs text-gray-500">documind / workspace</span>
                <div className="w-4 h-4 text-gray-500">✓</div>
              </div>

              <div className="p-5 space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-xs bg-[#1e1f2e] rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-gray-200">
                      What changed in our activation strategy this quarter?
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-white">DocuMind</span>
                      <span className="text-xs text-gray-500">just now</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Activation shifted from{" "}
                      <strong className="text-white">onboarding volume</strong> to{" "}
                      <strong className="text-white">time-to-value.</strong> The team is prioritizing...
                    </p>
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-xs text-gray-400 w-fit cursor-pointer hover:bg-white/8 transition-colors">
                      <span>📄</span>
                      <span>Q3 strategy.pdf · p.4</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#0d0f1a] px-4 py-3">
                  <span className="text-sm text-gray-500 flex-1">Ask a follow-up</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute -bottom-4 -right-4 bg-[#1a1b2e] border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-xl"
            >
              <span className="text-yellow-400">⚡</span>
              <span className="text-sm font-semibold text-white">42%</span>
              <span className="text-sm text-gray-400">faster research</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">
              Everything you need to{" "}
              <span className="text-gradient">think faster</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              DocuMind gives your team one place to understand every document you've ever written.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`p-6 rounded-2xl border border-white/8 bg-gradient-to-br ${feature.color} backdrop-blur-sm hover:border-white/15 transition-colors`}
              >
                <div className={`mb-4 ${feature.iconColor}`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">
              How it <span className="text-gradient">works</span>
            </h2>
            <p className="text-gray-400 text-lg">
              From upload to insight in three simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-purple-500/30 to-transparent -translate-x-4 z-0" />
                )}
                <div className="text-5xl font-black text-purple-500/20 mb-4">{step.number}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/40 to-violet-900/20 border border-purple-500/20 rounded-3xl p-12"
          >
            <h2 className="text-4xl font-black mb-4">
              Ready to think <span className="text-gradient">faster?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of teams who use DocuMind to get more out of their documents.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-purple-500/30 text-base"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-gray-500 text-sm">© 2026 DocuMind. All rights reserved.</span>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
