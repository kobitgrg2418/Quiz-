"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Moon,
  Search,
  Sun,
  Command,
  User,
  Settings,
  LogOut,
  CheckCheck,
  FileText,
  BrainCircuit,
  Layers,
  StickyNote,
  Loader2,
  X,
} from "lucide-react";

const mockNotifications = [
  { id: 1, text: "Your ML Fundamentals quiz is ready", time: "2 min ago", unread: true },
  { id: 2, text: "Study streak: 7 days! Keep going!", time: "1 hour ago", unread: true },
  { id: 3, text: "New flashcards generated from your upload", time: "3 hours ago", unread: false },
];

interface SearchResult {
  id: string;
  title: string;
  type: "document" | "quiz" | "flashcard" | "note";
}

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

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setMounted(true), []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        const merged: SearchResult[] = [
          ...data.documents.map((d: { id: string; title: string }) => ({
            id: d.id,
            title: d.title,
            type: "document" as const,
          })),
          ...data.quizzes.map((q: { id: string; title: string }) => ({
            id: q.id,
            title: q.title,
            type: "quiz" as const,
          })),
          ...data.flashcardSets.map((f: { id: string; title: string }) => ({
            id: f.id,
            title: f.title,
            type: "flashcard" as const,
          })),
          ...data.notes.map((n: { id: string; title: string }) => ({
            id: n.id,
            title: n.title,
            type: "note" as const,
          })),
        ];
        setResults(merged);
        setSelectedIdx(-1);
      }
    } catch {
      // Silently fail
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSearch(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const navigateToResult = (result: SearchResult) => {
    setShowSearch(false);
    setQuery("");
    setResults([]);
    switch (result.type) {
      case "document":
        router.push(`/lectures/${result.id}`);
        break;
      case "quiz":
        router.push(`/quizzes/${result.id}`);
        break;
      case "flashcard":
        router.push(`/flashcards/${result.id}`);
        break;
      case "note":
        router.push(`/notes`);
        break;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearch || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        doSearch(query);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      navigateToResult(results[selectedIdx]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />;
      case "quiz": return <BrainCircuit size={14} style={{ color: "#7C3AED", flexShrink: 0 }} />;
      case "flashcard": return <Layers size={14} style={{ color: "#10B981", flexShrink: 0 }} />;
      case "note": return <StickyNote size={14} style={{ color: "#F59E0B", flexShrink: 0 }} />;
      default: return <FileText size={14} />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "document": return "Lecture";
      case "quiz": return "Quiz";
      case "flashcard": return "Flashcards";
      case "note": return "Note";
      default: return type;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowSearch(false);
    inputRef.current?.blur();
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "VP";

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="vp-topbar">
      {/* Search Bar */}
      <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 480 }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--vp-text-3)",
            pointerEvents: "none",
          }}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => { if (query.trim() || results.length > 0) setShowSearch(true); }}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search lectures, quizzes, flashcards..."
          className="vp-input"
          style={{
            paddingLeft: 34,
            paddingRight: query ? 70 : 60,
            height: 38,
            fontSize: 13,
            background: "var(--vp-surface-solid)",
            borderColor: showSearch ? "var(--vp-primary, #7C3AED)" : "var(--vp-border)",
            transition: "border-color 0.15s",
          }}
        />
        {query ? (
          <button
            onClick={clearSearch}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              padding: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--vp-text-3)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <div
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span className="kbd"><Command size={10} /></span>
            <span className="kbd">K</span>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showSearch && (query.trim() || results.length > 0) && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "var(--vp-surface-solid)",
              border: "1px solid var(--vp-border)",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              zIndex: 200,
              overflow: "hidden",
              maxHeight: 400,
            }}
          >
            {searching ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 16px", color: "var(--vp-text-3)" }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 13 }}>Searching...</span>
              </div>
            ) : results.length === 0 && query.trim() ? (
              <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--vp-text-3)" }}>
                <Search size={20} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                <div style={{ fontSize: 13 }}>No results for &ldquo;{query}&rdquo;</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Try a different search term</div>
              </div>
            ) : results.length > 0 ? (
              <div style={{ overflowY: "auto", maxHeight: 380 }}>
                <div style={{ padding: "8px 12px 4px", fontSize: 11, fontWeight: 600, color: "var(--vp-text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </div>
                {results.map((result, idx) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => navigateToResult(result)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: 13,
                      background: idx === selectedIdx ? "var(--vp-surface-hi)" : "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                  >
                    {getIcon(result.type)}
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {result.title}
                    </span>
                    <span style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "var(--vp-surface-hi)",
                      color: "var(--vp-text-3)",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}>
                      {getLabel(result.type)}
                    </span>
                  </button>
                ))}
                <div style={{ padding: "6px 12px 8px", fontSize: 11, color: "var(--vp-text-3)", borderTop: "1px solid var(--vp-border)" }}>
                  <span style={{ opacity: 0.7 }}>↑↓ navigate · ↵ open · esc close</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
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
              background: "var(--vp-surface-solid)",
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
              background: "var(--vp-surface-solid)",
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
