"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AIOrb } from "@/components/ui/ai-orb";
import { GlowBlob } from "@/components/ui/glow-blob";
import { ProgressRing } from "@/components/ui/progress-ring";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div className="page-bg" />

      {/* LEFT — illustration */}
      <div style={{
        position: "relative",
        borderRight: "1px solid var(--vp-border)",
        padding: 40,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <GlowBlob color="rgba(124,58,237,0.45)" size={500} top={-100} left={-150} />
        <GlowBlob color="rgba(6,182,212,0.4)" size={500} bottom={-100} right={-150} animate={false} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <Logo size="md" />
          <Link href="/" className="vp-btn vp-btn-ghost vp-btn-sm" style={{ textDecoration: "none" }}>
            <ArrowLeft size={14} /> Back
          </Link>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", zIndex: 1 }}>
          {/* Animated showcase cards */}
          <div style={{ position: "relative", width: 380, height: 420 }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 40,
              width: 300,
              padding: 18,
              background: "var(--vp-surface)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--vp-border-hi)",
              borderRadius: 16,
              boxShadow: "var(--vp-shadow-pop)",
              transform: "rotate(-3deg)",
              animation: "float 7s ease-in-out infinite",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>Flashcard · 14/47</span>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                What is a memory page fault?
              </div>
            </div>

            <div style={{
              position: "absolute",
              top: 110,
              left: 0,
              width: 320,
              padding: 18,
              background: "var(--vp-surface)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--vp-border-hi)",
              borderRadius: 16,
              boxShadow: "var(--vp-shadow-pop)",
              transform: "rotate(2deg)",
              animation: "float 8s ease-in-out infinite 1s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <AIOrb size={14} animate={false} />
                <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>AI is generating quiz…</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[80, 60, 90].map((w, i) => (
                  <div key={i} style={{
                    height: 10,
                    borderRadius: 4,
                    width: w + "%",
                    background: "linear-gradient(90deg, rgba(124,58,237,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s linear infinite",
                    animationDelay: i * 0.15 + "s",
                  }} />
                ))}
              </div>
            </div>

            <div style={{
              position: "absolute",
              top: 240,
              left: 60,
              width: 280,
              padding: 18,
              background: "var(--vp-surface)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--vp-border-hi)",
              borderRadius: 16,
              boxShadow: "var(--vp-shadow-pop)",
              transform: "rotate(-2deg)",
              animation: "float 6s ease-in-out infinite 0.5s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>Today&apos;s mastery</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ProgressRing value={84} size={64} stroke={5} />
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>+12%</div>
                  <div style={{ fontSize: 11, color: "var(--vp-text-3)" }}>vs. yesterday</div>
                </div>
              </div>
            </div>

            <div style={{ position: "absolute", top: 200, right: -20 }}>
              <AIOrb size={56} />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "var(--vp-text-2)", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--vp-text)", marginBottom: 8 }}>
            &ldquo;I finally stopped re-reading my notes. The viva mode is like having a TA on call.&rdquo;
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
            <div className="vp-avatar" style={{ width: 36, height: 36 }}>MR</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--vp-text)" }}>Maya Roberts</div>
              <div style={{ fontSize: 12, color: "var(--vp-text-3)" }}>CS Junior, MIT · 84-day streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        position: "relative",
        zIndex: 1,
      }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="vp-btn vp-btn-ghost vp-btn-icon"
          style={{ position: "absolute", top: 24, right: 24, borderRadius: "var(--r-sm)" }}
        >
          {mounted ? (theme === "dark" ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} />}
        </button>

        {children}
      </div>
    </div>
  );
}
