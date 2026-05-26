"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  Layers,
  BarChart3,
  StickyNote,
  Settings,
  GraduationCap,
  Briefcase,
  Upload,
  MessageSquare,
  CreditCard,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "⌘1" },
  { href: "/lectures", label: "My Lectures", icon: FileText, shortcut: "⌘2" },
  { href: "/quizzes", label: "Quizzes", icon: BrainCircuit, shortcut: "⌘3" },
  { href: "/flashcards", label: "Flashcards", icon: Layers, shortcut: "⌘4" },
  { href: "/viva", label: "Viva Prep", icon: GraduationCap, shortcut: "⌘5" },
  { href: "/interview", label: "Interview Prep", icon: Briefcase },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomItems = [
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`vp-sidebar ${isOpen ? "open" : ""}`}>
      <div style={{ padding: "4px 4px 16px", borderBottom: "1px solid var(--vp-border)", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }} onClick={onClose}>
          <Logo size="md" />
        </Link>
        {/* Mobile close button */}
        <button
          className="mobile-menu-btn"
          onClick={onClose}
          aria-label="Close menu"
          style={{ border: "none", background: "none", padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ marginBottom: 8, padding: "0 4px" }}>
        <Link
          href="/lectures"
          className="vp-btn vp-btn-primary vp-btn-sm"
          style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
          onClick={onClose}
        >
          <Upload size={14} />
          Upload PDF
        </Link>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`vp-sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <span className="sidebar-shortcut" style={{
                  fontFamily: "var(--font-mono-vp)",
                  fontSize: 11,
                  color: "var(--vp-text-3)",
                  background: "var(--vp-surface-hi)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  border: "1px solid var(--vp-border)",
                }}>
                  {item.shortcut}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--vp-border)", paddingTop: 8, marginTop: 8 }}>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`vp-sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
