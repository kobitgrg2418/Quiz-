"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
      } else {
        toast.success("Welcome back!");
        window.location.href = "/dashboard";
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380 }}>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: 36,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        margin: "0 0 8px",
      }}>
        Welcome back.
      </h1>
      <p style={{ color: "var(--vp-text-2)", fontSize: 14, margin: "0 0 32px" }}>
        Sign in to your study workspace.
      </p>

      {/* Social logins */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        <button type="button" className="vp-btn vp-btn-ghost" style={{ width: "100%", justifyContent: "center", height: 44 }}
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        <button type="button" className="vp-btn vp-btn-ghost" style={{ width: "100%", justifyContent: "center", height: 44 }}
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "var(--vp-border)" }} />
        <span style={{ fontSize: 11, color: "var(--vp-text-3)" }}>OR WITH EMAIL</span>
        <div style={{ flex: 1, height: 1, background: "var(--vp-border)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--vp-text-2)", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="vp-input"
            placeholder="you@university.edu"
            required
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--vp-text-2)" }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--vp-text-2)", fontWeight: 500, textDecoration: "none" }}>
              Forgot?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="vp-input"
              placeholder="••••••••"
              required
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                padding: 6,
                color: "var(--vp-text-3)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="vp-btn vp-btn-primary vp-btn-lg"
        style={{ width: "100%", justifyContent: "center", marginTop: 24 }}
        disabled={loading}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 14,
              height: 14,
              border: "2px solid white",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "glow-rotate 0.8s linear infinite",
            }} />
            Signing in…
          </span>
        ) : (
          <>Sign in <ArrowRight size={16} /></>
        )}
      </button>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--vp-text-2)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "var(--vp-text)", fontWeight: 600, textDecoration: "none" }}>
          Sign up
        </Link>
      </div>
    </form>
  );
}
