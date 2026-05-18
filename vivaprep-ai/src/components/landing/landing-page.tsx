"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Upload,
  Sparkles,
  BrainCircuit,
  Layers,
  GraduationCap,
  Briefcase,
  MessageSquare,
  BarChart3,
  Sun,
  Moon,
  Play,
  Star,
  Cpu,
  Globe,
  Zap,
  FileText,
  Mic,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AIOrb } from "@/components/ui/ai-orb";
import { GlowBlob } from "@/components/ui/glow-blob";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: BrainCircuit,
    title: "AI Quiz Generator",
    description: "MCQ, true/false, fill-blank, scenario — all generated from your PDF in seconds.",
    span: true,
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    description: "Auto-generated with spaced repetition scheduling. Flip, swipe, master.",
  },
  {
    icon: GraduationCap,
    title: "Viva Preparation",
    description: "AI examiner that adjusts difficulty based on your answers.",
  },
  {
    icon: Briefcase,
    title: "Interview Prep",
    description: "Technical, behavioral, and scenario questions tailored to your material.",
  },
  {
    icon: MessageSquare,
    title: "Chat with PDF",
    description: "RAG-powered chat grounded in your document. Every answer cites the source page.",
  },
  {
    icon: BarChart3,
    title: "Study Analytics",
    description: "Track mastery by topic, study streaks, and performance trends over time.",
  },
];

const howItWorks = [
  { step: "01", title: "Upload your PDF", desc: "Drag and drop. We read up to 800 pages in under a minute." },
  { step: "02", title: "AI extracts concepts", desc: "We chunk, embed, and index every concept and definition." },
  { step: "03", title: "Generate study tools", desc: "Quiz, flashcards, viva questions, notes — all in one click." },
  { step: "04", title: "Study & master", desc: "Spaced repetition, AI feedback, and analytics close every gap." },
];

const testimonials = [
  {
    name: "Maya Roberts",
    role: "CS Junior, MIT",
    content: "I finally stopped re-reading my notes. The viva mode is like having a TA on call.",
    avatar: "MR",
  },
  {
    name: "James Okafor",
    role: "Medical Student, UCL",
    content: "Generated 200 flashcards from my anatomy PDF in under a minute. Absolute game-changer.",
    avatar: "JO",
  },
  {
    name: "Emily Chen",
    role: "Law Student, Stanford",
    content: "The quiz explanations are better than most textbooks. My exam scores jumped 15%.",
    avatar: "EC",
  },
  {
    name: "Rahul Patel",
    role: "Engineering, IIT Bombay",
    content: "Chat with PDF is incredible — I ask follow-up questions and it cites the exact slide.",
    avatar: "RP",
  },
];

const faqItems = [
  { q: "What file types can I upload?", a: "PDF files up to 100MB and 800 pages. Support for PPTX, DOCX, EPUB, TXT, and Markdown is coming soon." },
  { q: "How accurate are the AI-generated questions?", a: "We use GPT-4o-mini with RAG grounding — every question is derived from your source material. Accuracy depends on input quality, but hallucinations are minimised by citing page numbers." },
  { q: "Can I use this for any subject?", a: "Yes. VivaPrep AI works with any discipline — from medicine and law to computer science and humanities." },
  { q: "Is my data secure?", a: "All uploads are encrypted at rest and in transit. We never share your data with third parties. Your study materials remain private to your account." },
  { q: "Can I export my study materials?", a: "Pro and Team plans can export quizzes, flashcards, and notes to PDF for offline studying." },
];

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="page-bg" />

      {/* ===== NAV ===== */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        borderBottom: "1px solid var(--vp-border)",
        background: "var(--vp-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: "100%",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Logo size="md" />

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "How It Works", "Pricing", "FAQ"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ fontSize: 14, color: "var(--vp-text-2)", textDecoration: "none", fontWeight: 500 }}
              >
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="vp-btn vp-btn-ghost vp-btn-icon vp-btn-sm"
              style={{ borderRadius: "var(--r-sm)" }}
            >
              {mounted ? (theme === "dark" ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} />}
            </button>
            <Link href="/login" className="vp-btn vp-btn-ghost vp-btn-sm" style={{ textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/register" className="vp-btn vp-btn-primary vp-btn-sm" style={{ textDecoration: "none" }}>
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span className="chip chip-grad">
                <span className="dot dot-live" />
                Now in public beta
              </span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              margin: "0 auto",
              maxWidth: 800,
            }}>
              Turn any lecture into a{" "}
              <span className="grad-text">study operating system.</span>
            </h1>

            <p style={{
              fontSize: 18,
              color: "var(--vp-text-2)",
              lineHeight: 1.6,
              maxWidth: 560,
              margin: "20px auto 0",
            }}>
              Upload a PDF. Get quizzes, flashcards, viva questions, interview prep,
              and an AI chat — all grounded in your source material.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 32 }}>
              <Link href="/register" className="vp-btn vp-btn-primary vp-btn-lg" style={{ textDecoration: "none" }}>
                <Upload size={16} /> Upload your first PDF
              </Link>
              <button className="vp-btn vp-btn-ghost vp-btn-lg">
                <Play size={14} /> Watch demo
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 20, fontSize: 12, color: "var(--vp-text-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={12} style={{ color: "#10B981" }} /> No credit card
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={12} style={{ color: "#10B981" }} /> 3 free study sets
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={12} style={{ color: "#10B981" }} /> GDPR & SOC 2
              </span>
            </div>
          </motion.div>

          {/* Hero mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ marginTop: 60, position: "relative", maxWidth: 960, margin: "60px auto 0" }}
          >
            <div style={{
              borderRadius: 16,
              border: "1px solid var(--vp-border-hi)",
              background: "var(--vp-surface)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--vp-shadow-pop)",
              overflow: "hidden",
            }}>
              {/* Browser chrome */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid var(--vp-border)",
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
                </div>
                <div style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--vp-text-3)",
                  background: "var(--vp-surface-hi)",
                  borderRadius: "var(--r-full)",
                  padding: "4px 12px",
                  maxWidth: 300,
                  margin: "0 auto",
                }}>
                  vivaprep.ai/dashboard
                </div>
              </div>

              {/* Mock dashboard content */}
              <div style={{ padding: 24, display: "grid", gridTemplateColumns: "48px 1fr 280px", gap: 16, minHeight: 340 }}>
                {/* Mini sidebar */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
                  {[LayoutDashboard, FileText, BrainCircuit, Layers, GraduationCap, MessageSquare].map((Icon, i) => (
                    <div
                      key={i}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--r-sm)",
                        background: i === 0 ? "rgba(124,58,237,0.15)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} style={{ color: i === 0 ? "#7C3AED" : "var(--vp-text-3)" }} />
                    </div>
                  ))}
                </div>

                {/* Main content area with floating cards */}
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute",
                    top: 10,
                    left: 20,
                    width: 260,
                    padding: 16,
                    background: "var(--vp-surface-solid)",
                    border: "1px solid var(--vp-border-hi)",
                    borderRadius: 14,
                    boxShadow: "var(--vp-shadow-card)",
                    animation: "float 7s ease-in-out infinite",
                    zIndex: 2,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Sparkles size={14} style={{ color: "#7C3AED" }} />
                      <span style={{ fontSize: 12, color: "var(--vp-text-3)" }}>Quiz · Q3 of 12</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
                      Which scheduling algorithm minimises average waiting time?
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {["FCFS", "SJF", "RR", "MLFQ"].map((o, i) => (
                        <span key={o} style={{
                          padding: "4px 10px",
                          borderRadius: "var(--r-full)",
                          fontSize: 11,
                          fontWeight: 500,
                          background: i === 1 ? "rgba(16,185,129,0.15)" : "var(--vp-surface-hi)",
                          border: "1px solid " + (i === 1 ? "rgba(16,185,129,0.3)" : "var(--vp-border)"),
                          color: i === 1 ? "#10B981" : "var(--vp-text-2)",
                        }}>
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    position: "absolute",
                    top: 140,
                    right: 10,
                    width: 200,
                    padding: 14,
                    background: "var(--vp-surface-solid)",
                    border: "1px solid var(--vp-border-hi)",
                    borderRadius: 14,
                    boxShadow: "var(--vp-shadow-card)",
                    animation: "float 8s ease-in-out infinite 1s",
                    zIndex: 3,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <AIOrb size={14} animate={false} />
                      <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>AI Chat</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--vp-text-2)", lineHeight: 1.5 }}>
                      SJF is provably optimal for minimising avg wait time...
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <span className="chip" style={{ height: 20, fontSize: 10 }}>p.14</span>
                      <span className="chip" style={{ height: 20, fontSize: 10 }}>p.17</span>
                    </div>
                  </div>

                  <div style={{
                    position: "absolute",
                    bottom: 10,
                    left: 40,
                    width: 220,
                    padding: 14,
                    background: "var(--vp-surface-solid)",
                    border: "1px solid var(--vp-border-hi)",
                    borderRadius: 14,
                    boxShadow: "var(--vp-shadow-card)",
                    animation: "float 6s ease-in-out infinite 0.5s",
                    zIndex: 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Layers size={14} style={{ color: "#3B82F6" }} />
                      <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>Flashcard · 7/24</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Deadlock</div>
                    <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 4 }}>
                      A state where two or more processes are blocked forever...
                    </div>
                  </div>
                </div>

                {/* Right stats panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Mastery score", value: "84%", color: "#7C3AED" },
                    { label: "Study streak", value: "27 days", color: "#06B6D4" },
                    { label: "Questions answered", value: "1,284", color: "#3B82F6" },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "var(--vp-surface-hi)",
                      border: "1px solid var(--vp-border)",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--vp-text-3)", marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.02em", color: s.color }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* University logos */}
          <div style={{ marginTop: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "var(--vp-text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Trusted by students at
            </span>
            {["Stanford", "MIT", "Cambridge", "IIT Bombay", "ETH Zürich", "NUS", "UT Austin"].map((u) => (
              <span key={u} style={{ fontSize: 13, color: "var(--vp-text-3)", fontWeight: 500 }}>{u}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" style={{ padding: "80px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em" }}>
              One PDF. <span className="grad-text">Six superpowers.</span>
            </h2>
            <p style={{ color: "var(--vp-text-2)", fontSize: 16, marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>
              Every feature is grounded in your source material — no hallucinations, always cited.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="vp-card"
                style={{
                  gridColumn: i === 0 ? "span 2" : undefined,
                  cursor: "default",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--grad)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  boxShadow: "0 8px 20px -6px rgba(124,58,237,0.5)",
                }}>
                  <f.icon size={22} color="white" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 6 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--vp-text-2)", lineHeight: 1.6 }}>
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" style={{ padding: "80px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em" }}>
              From PDF to mastery in <span className="grad-text">four steps.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {howItWorks.map((s) => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-mono-vp)",
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  marginBottom: 12,
                }}>
                  <span className="grad-text">{s.step}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--vp-text-2)", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PREVIEW STRIP ===== */}
      <section style={{ padding: "40px 0 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {/* Flashcard preview */}
            <div className="vp-card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--vp-text-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
                Flashcard preview
              </div>
              <div style={{
                width: "100%",
                aspectRatio: "3/2",
                borderRadius: 16,
                background: "var(--grad-soft)",
                border: "1px solid var(--vp-border-hi)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Context Switch
                  </div>
                  <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 6 }}>
                    Tap to flip
                  </div>
                </div>
              </div>
              <span className="chip" style={{ height: 22, fontSize: 11 }}>Scheduling</span>
            </div>

            {/* Quiz preview */}
            <div className="vp-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: "var(--vp-text-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
                Live quiz
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 16 }}>
                What is the primary purpose of the TLB?
              </div>
              {[
                { l: "A", t: "Store the full page table", state: "idle" },
                { l: "B", t: "Cache recent translations", state: "correct" },
                { l: "C", t: "Detect page faults faster", state: "wrong" },
                { l: "D", t: "Compress the page table", state: "idle" },
              ].map((o) => (
                <div key={o.l} style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  border: "1px solid " + (
                    o.state === "correct" ? "rgba(16,185,129,0.5)" :
                    o.state === "wrong" ? "rgba(239,68,68,0.5)" : "var(--vp-border)"
                  ),
                  background:
                    o.state === "correct" ? "rgba(16,185,129,0.1)" :
                    o.state === "wrong" ? "rgba(239,68,68,0.1)" : "transparent",
                  opacity: o.state === "idle" ? 0.5 : 1,
                }}>
                  <span style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: o.state === "correct" ? "#10B981" : o.state === "wrong" ? "#EF4444" : "var(--vp-surface-hi)",
                    color: o.state !== "idle" ? "white" : "var(--vp-text-2)",
                    border: o.state === "idle" ? "1px solid var(--vp-border)" : "none",
                  }}>
                    {o.state === "correct" ? <Check size={12} /> : o.l}
                  </span>
                  <span>{o.t}</span>
                </div>
              ))}
            </div>

            {/* AI Viva preview */}
            <div className="vp-card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 50% 20%, rgba(124,58,237,0.2), transparent 50%)",
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 11, color: "var(--vp-text-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
                  AI Viva Examiner
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <AIOrb size={56} />
                </div>
                <div style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "var(--vp-surface)",
                  border: "1px solid var(--vp-border)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--vp-text-2)",
                  textAlign: "center",
                }}>
                  &ldquo;Explain how a TLB miss is resolved in a multi-level page table.&rdquo;
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                      width: 4,
                      height: 12 + Math.sin(i) * 8,
                      borderRadius: 2,
                      background: "var(--grad)",
                      opacity: 0.6 + i * 0.08,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" style={{ padding: "80px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em" }}>
              Loved by <span className="grad-text">students worldwide.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {testimonials.map((t) => (
              <div key={t.name} className="vp-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} style={{ fill: "#F59E0B", color: "#F59E0B" }} />
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--vp-text-2)", marginBottom: 16, fontStyle: "italic" }}>
                  &ldquo;{t.content}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="vp-avatar" style={{ width: 36, height: 36 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" style={{ padding: "80px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em" }}>
              Simple, <span className="grad-text">transparent pricing.</span>
            </h2>
            <p style={{ color: "var(--vp-text-2)", fontSize: 15, marginTop: 8 }}>
              Start free. Upgrade when you need more.
            </p>
          </div>

          {/* Billing toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40 }}>
            <span style={{ fontSize: 13, color: billingAnnual ? "var(--vp-text-3)" : "var(--vp-text)", fontWeight: 500 }}>Monthly</span>
            <button
              onClick={() => setBillingAnnual(!billingAnnual)}
              style={{
                width: 48,
                height: 26,
                borderRadius: "var(--r-full)",
                background: billingAnnual ? "var(--grad)" : "var(--vp-surface-hi)",
                border: "1px solid var(--vp-border)",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute",
                top: 3,
                left: billingAnnual ? 24 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s var(--ease)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </button>
            <span style={{ fontSize: 13, color: billingAnnual ? "var(--vp-text)" : "var(--vp-text-3)", fontWeight: 500 }}>
              Annual
              <span style={{
                marginLeft: 6,
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: "var(--r-full)",
                background: "rgba(16,185,129,0.15)",
                color: "#10B981",
                fontWeight: 600,
              }}>
                Save 25%
              </span>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 900, margin: "0 auto" }}>
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: ["5 PDF uploads", "50 quiz questions / month", "Basic flashcards", "Limited chat"],
                cta: "Get started",
                popular: false,
              },
              {
                name: "Pro",
                priceMonthly: "$12",
                priceAnnual: "$9",
                period: "/mo",
                features: ["Unlimited uploads", "Unlimited quizzes", "Advanced flashcards with SR", "Unlimited AI chat", "Viva & Interview prep", "Analytics dashboard", "Export to PDF"],
                cta: "Start free trial",
                popular: true,
              },
              {
                name: "Team",
                priceMonthly: "$24",
                priceAnnual: "$18",
                period: "/mo",
                features: ["Everything in Pro", "5 team members", "Collaborative study rooms", "Shared flashcard sets", "Priority support", "Admin dashboard"],
                cta: "Contact sales",
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="vp-card"
                style={{
                  padding: 28,
                  background: plan.popular ? "var(--grad-soft)" : undefined,
                  borderColor: plan.popular ? "rgba(124,58,237,0.3)" : undefined,
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}>
                    <span className="chip chip-grad" style={{ fontSize: 11, fontWeight: 600 }}>
                      Most popular
                    </span>
                  </div>
                )}
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                  {plan.name}
                </h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 12, marginBottom: 20 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em" }}>
                    {"priceMonthly" in plan ? (billingAnnual ? plan.priceAnnual : plan.priceMonthly) : plan.price}
                  </span>
                  <span style={{ color: "var(--vp-text-3)", fontSize: 13 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--vp-text-2)", padding: "6px 0" }}>
                      <Check size={14} style={{ color: "#7C3AED", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.popular ? "vp-btn vp-btn-primary" : "vp-btn vp-btn-ghost"}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {plan.cta} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" style={{ padding: "80px 0", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em" }}>
              Frequently asked <span className="grad-text">questions.</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className="vp-card"
                style={{ padding: 0, cursor: "pointer" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  fontWeight: 500,
                  fontSize: 14,
                }}>
                  {faq.q}
                  <ChevronDown
                    size={16}
                    style={{
                      color: "var(--vp-text-3)",
                      transition: "transform 0.2s var(--ease)",
                      transform: openFaq === i ? "rotate(180deg)" : "rotate(0)",
                      flexShrink: 0,
                    }}
                  />
                </div>
                {openFaq === i && (
                  <div className="fade-up" style={{ padding: "0 20px 16px", fontSize: 13, color: "var(--vp-text-2)", lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FOOTER ===== */}
      <section style={{ padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          borderRadius: 24,
          background: "var(--grad)",
          padding: "60px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <GlowBlob color="rgba(255,255,255,0.15)" size={400} top={-100} left={-100} animate={false} />
          <GlowBlob color="rgba(6,182,212,0.3)" size={300} bottom={-80} right={-80} animate={false} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em", color: "white", marginBottom: 12 }}>
              Ready to study smarter?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 480, margin: "0 auto 28px" }}>
              Join thousands of students using AI to transform their study experience.
            </p>
            <Link
              href="/register"
              className="vp-btn vp-btn-lg"
              style={{
                background: "white",
                color: "#7C3AED",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.3)",
              }}
            >
              Get started for free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        borderTop: "1px solid var(--vp-border)",
        padding: "48px 24px 24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
          gap: 32,
          paddingBottom: 32,
        }}>
          <div>
            <Logo size="md" />
            <p style={{ fontSize: 13, color: "var(--vp-text-3)", lineHeight: 1.6, marginTop: 12, maxWidth: 280 }}>
              AI-powered study platform that turns lecture PDFs into interactive quizzes, flashcards, and more.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Resources", links: ["Documentation", "Blog", "Community", "Support"] },
            { title: "Company", links: ["About", "Careers", "Contact", "Press Kit"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--vp-text)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>
                {col.title}
              </div>
              {col.links.map((l) => (
                <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "var(--vp-text-3)", marginBottom: 8, textDecoration: "none" }}>
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          borderTop: "1px solid var(--vp-border)",
          paddingTop: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <span style={{ fontSize: 12, color: "var(--vp-text-3)" }}>
            &copy; 2025 VivaPrep AI. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {["SOC 2", "GDPR", "ISO 27001"].map((b) => (
              <span key={b} className="chip" style={{ height: 22, fontSize: 10 }}>{b}</span>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="dot dot-live" />
              <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LayoutDashboard(props: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
