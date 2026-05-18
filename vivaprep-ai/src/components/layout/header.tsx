"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun, Command } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="vp-topbar">
      <div style={{
        position: "relative",
        flex: 1,
        maxWidth: 420,
      }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--vp-text-3)",
          }}
        />
        <input
          placeholder="Search lectures, quizzes, flashcards..."
          className="vp-input"
          style={{
            paddingLeft: 34,
            paddingRight: 60,
            height: 38,
            fontSize: 13,
            background: "var(--vp-surface-hi)",
            borderColor: "var(--vp-border)",
          }}
        />
        <div style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}>
          <span className="kbd"><Command size={10} /></span>
          <span className="kbd">K</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="vp-btn vp-btn-ghost vp-btn-icon vp-btn-sm"
          style={{ borderRadius: "var(--r-sm)" }}
        >
          {mounted ? (theme === "dark" ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} />}
        </button>

        <button
          className="vp-btn vp-btn-ghost vp-btn-icon vp-btn-sm"
          style={{ borderRadius: "var(--r-sm)", position: "relative" }}
        >
          <Bell size={16} />
          <span style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#7C3AED",
          }} />
        </button>

        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--grad)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          marginLeft: 4,
        }}>
          VP
        </div>
      </div>
    </header>
  );
}
