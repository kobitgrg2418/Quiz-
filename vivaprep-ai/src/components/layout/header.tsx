"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Moon, Search, Sun, Command, User, Settings, LogOut, CheckCheck } from "lucide-react";

const mockNotifications = [
  { id: 1, text: "Your ML Fundamentals quiz is ready", time: "2 min ago", unread: true },
  { id: 2, text: "Study streak: 7 days! Keep going!", time: "1 hour ago", unread: true },
  { id: 3, text: "New flashcards generated from your upload", time: "3 hours ago", unread: false },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "VP";

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="vp-btn vp-btn-ghost vp-btn-icon vp-btn-sm"
            style={{ borderRadius: "var(--r-sm)", position: "relative" }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#7C3AED",
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 320,
              background: "var(--vp-surface)",
              border: "1px solid var(--vp-border)",
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              zIndex: 100,
              overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--vp-border)",
              }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      fontSize: 12,
                      color: "#7C3AED",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--vp-border)",
                      background: n.unread ? "color-mix(in srgb, #7C3AED 5%, transparent)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 13, marginBottom: 4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: "var(--vp-text-3)" }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: session?.user?.image ? `url(${session.user.image}) center/cover` : "var(--grad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              marginLeft: 4,
            }}
          >
            {!session?.user?.image && userInitials}
          </div>

          {showProfileMenu && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 220,
              background: "var(--vp-surface)",
              border: "1px solid var(--vp-border)",
              borderRadius: 12,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              zIndex: 100,
              overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--vp-border)" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{session?.user?.name || "User"}</div>
                <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 2 }}>
                  {session?.user?.email || ""}
                </div>
              </div>
              <div style={{ padding: 4 }}>
                <button
                  onClick={() => { setShowProfileMenu(false); router.push("/settings"); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    background: "none",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "inherit",
                    textAlign: "left",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--vp-surface-hi)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  <User size={14} /> Profile
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); router.push("/settings"); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    background: "none",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "inherit",
                    textAlign: "left",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--vp-surface-hi)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  <Settings size={14} /> Settings
                </button>
              </div>
              <div style={{ borderTop: "1px solid var(--vp-border)", padding: 4 }}>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    background: "none",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "#EF4444",
                    textAlign: "left",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--vp-surface-hi)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
