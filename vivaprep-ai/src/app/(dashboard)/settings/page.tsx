"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Camera,
  Trash2,
  Loader2,
  Lock,
  BookOpen,
  Globe,
  Clock,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

/* ── Toggle Switch component ── */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        background: checked ? "var(--grad-1)" : "var(--vp-surface-hi)",
        border: `1px solid ${checked ? "rgba(124,58,237,0.3)" : "var(--vp-border-hi)"}`,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s, border-color 0.2s",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          display: "block",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          transition: "left 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </button>
  );
}

/* ── Section Card wrapper ── */
function SectionCard({
  icon: Icon,
  title,
  description,
  danger,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="vp-card"
      style={{
        borderColor: danger ? "rgba(239,68,68,0.25)" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--r-sm)",
            background: danger
              ? "rgba(239,68,68,0.1)"
              : "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color: danger ? "#EF4444" : "var(--grad-1)" }} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: danger ? "#EF4444" : "var(--vp-text)" }}>
            {title}
          </h3>
          <p style={{ fontSize: 13, color: "var(--vp-text-3)", marginTop: 2 }}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Setting Row ── */
function SettingRow({
  label,
  description,
  children,
  border = true,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 0",
        borderBottom: border ? "1px solid var(--vp-border)" : "none",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--vp-text)" }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 2 }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Sidebar tab navigation
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Photo
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Notification preferences (local state)
  const [notifQuiz, setNotifQuiz] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifContent, setNotifContent] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Study preferences
  const [dailyGoal, setDailyGoal] = useState("20");
  const [quizDifficulty, setQuizDifficulty] = useState("mixed");
  const [autoGenerateFlashcards, setAutoGenerateFlashcards] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    if (!email.trim()) { toast.error("Email cannot be empty"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update profile");
        return;
      }

      const updated = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
      await updateSession({ name: updated.name, email: updated.email });
      toast.success("Profile updated!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) { toast.error("Enter your current password"); return; }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to change password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Use JPG, PNG, WebP, or GIF");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/profile/photo", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to upload photo");
        return;
      }

      const data = await res.json();
      setProfile((prev) => (prev ? { ...prev, image: data.image } : prev));
      await updateSession({ image: data.image });
      toast.success("Photo updated!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeletePhoto() {
    setDeletingPhoto(true);
    try {
      const res = await fetch("/api/profile/photo", { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to remove photo"); return; }
      setProfile((prev) => (prev ? { ...prev, image: null } : prev));
      await updateSession({ image: null });
      toast.success("Photo removed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingPhoto(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete account"); return; }
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const userInitials = (profile?.name || session?.user?.name || "U")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const avatarUrl = profile?.image || session?.user?.image;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "study", label: "Study Preferences", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Danger Zone", icon: Shield },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "var(--vp-text-3)" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--r-sm)",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={20} style={{ color: "var(--grad-1)" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Settings</h1>
            <p style={{ fontSize: 14, color: "var(--vp-text-3)", marginTop: 2 }}>
              Manage your account, preferences, and study settings
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar tabs */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            position: "sticky",
            top: 92,
            alignSelf: "flex-start",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDanger = tab.id === "danger";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 38,
                    padding: "0 12px",
                    borderRadius: "var(--r-md)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: isDanger
                      ? isActive ? "#EF4444" : "var(--vp-text-3)"
                      : isActive ? "var(--vp-text)" : "var(--vp-text-2)",
                    background: isActive
                      ? isDanger
                        ? "rgba(239,68,68,0.08)"
                        : "linear-gradient(90deg, rgba(124,58,237,0.12), transparent)"
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {isActive && !isDanger && (
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 2,
                        borderRadius: 2,
                        background: "var(--grad)",
                      }}
                    />
                  )}
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20, paddingBottom: 60 }}>
          {/* ─── Profile ─── */}
          {activeTab === "profile" && (
            <>
              {/* Avatar card */}
              <SectionCard icon={Camera} title="Profile Photo" description="Upload a photo — JPG, PNG, WebP, GIF up to 5MB">
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: avatarUrl ? `url(${avatarUrl}) center/cover` : "var(--grad)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 24,
                      flexShrink: 0,
                      border: "3px solid var(--vp-border)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    {!avatarUrl && userInitials}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="vp-btn vp-btn-primary vp-btn-sm"
                        disabled={uploadingPhoto}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingPhoto ? (
                          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Camera size={14} />
                        )}
                        {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                      </button>

                      {avatarUrl && (
                        <button
                          className="vp-btn vp-btn-ghost vp-btn-sm"
                          disabled={deletingPhoto}
                          onClick={handleDeletePhoto}
                        >
                          {deletingPhoto ? (
                            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Remove
                        </button>
                      )}
                    </div>
                    {memberSince && (
                      <span style={{ fontSize: 12, color: "var(--vp-text-3)" }}>
                        <Clock size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />
                        Member since {memberSince}
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                </div>
              </SectionCard>

              {/* Profile info */}
              <SectionCard icon={User} title="Personal Information" description="Update your name and email address">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "var(--vp-text-2)" }}>
                      Full Name
                    </label>
                    <input
                      className="vp-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "var(--vp-text-2)" }}>
                      Email Address
                    </label>
                    <input
                      className="vp-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                    <button
                      className="vp-btn vp-btn-primary vp-btn-sm"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ─── Password ─── */}
          {activeTab === "password" && (
            <SectionCard icon={Lock} title="Change Password" description="Update your account password — minimum 8 characters">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "var(--vp-text-2)" }}>
                    Current Password
                  </label>
                  <input
                    className="vp-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "var(--vp-text-2)" }}>
                    New Password
                  </label>
                  <input
                    className="vp-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  {newPassword && newPassword.length < 8 && (
                    <span style={{ fontSize: 12, color: "#EF4444", marginTop: 4, display: "block" }}>
                      Password must be at least 8 characters
                    </span>
                  )}
                  {newPassword && newPassword.length >= 8 && (
                    <span style={{ fontSize: 12, color: "#10B981", marginTop: 4, display: "block" }}>
                      <Check size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: 2 }} />
                      Strong enough
                    </span>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "var(--vp-text-2)" }}>
                    Confirm New Password
                  </label>
                  <input
                    className="vp-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <span style={{ fontSize: 12, color: "#EF4444", marginTop: 4, display: "block" }}>
                      Passwords don&apos;t match
                    </span>
                  )}
                  {confirmPassword && confirmPassword === newPassword && confirmPassword.length >= 8 && (
                    <span style={{ fontSize: 12, color: "#10B981", marginTop: 4, display: "block" }}>
                      <Check size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: 2 }} />
                      Passwords match
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                  <button
                    className="vp-btn vp-btn-primary vp-btn-sm"
                    onClick={handleChangePassword}
                    disabled={changingPassword || !currentPassword || !newPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ─── Appearance ─── */}
          {activeTab === "appearance" && (
            <SectionCard icon={Palette} title="Appearance" description="Customize how VivaPrep looks on your device">
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--vp-text-2)", marginBottom: 12 }}>
                  Theme
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { id: "light", label: "Light", icon: Sun, desc: "Clean & bright" },
                    { id: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
                    { id: "system", label: "System", icon: Monitor, desc: "Match your OS" },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = mounted && theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          padding: "20px 12px",
                          borderRadius: "var(--r-md)",
                          border: `2px solid ${isActive ? "var(--grad-1)" : "var(--vp-border)"}`,
                          background: isActive
                            ? "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.04))"
                            : "var(--vp-surface-hi)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          color: "inherit",
                          fontFamily: "inherit",
                          position: "relative",
                        }}
                      >
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: "var(--grad)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={10} style={{ color: "white" }} />
                          </div>
                        )}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "var(--r-sm)",
                            background: isActive
                              ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.15))"
                              : "var(--vp-surface-hi)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={20} style={{ color: isActive ? "var(--grad-1)" : "var(--vp-text-3)" }} />
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
                        <div style={{ fontSize: 11, color: "var(--vp-text-3)" }}>{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 20, borderTop: "1px solid var(--vp-border)", paddingTop: 16 }}>
                <SettingRow label="Reduced motion" description="Minimize animations for accessibility" border={false}>
                  <Toggle checked={false} onChange={() => {}} />
                </SettingRow>
              </div>
            </SectionCard>
          )}

          {/* ─── Study Preferences ─── */}
          {activeTab === "study" && (
            <SectionCard icon={BookOpen} title="Study Preferences" description="Configure your learning experience">
              <div>
                <SettingRow label="Daily study goal" description="Minutes per day you want to study">
                  <select
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(e.target.value)}
                    className="vp-input"
                    style={{
                      width: 120,
                      height: 36,
                      fontSize: 13,
                      padding: "0 10px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="10">10 min</option>
                    <option value="20">20 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                  </select>
                </SettingRow>

                <SettingRow label="Default quiz difficulty" description="Difficulty level for auto-generated quizzes">
                  <select
                    value={quizDifficulty}
                    onChange={(e) => setQuizDifficulty(e.target.value)}
                    className="vp-input"
                    style={{
                      width: 120,
                      height: 36,
                      fontSize: 13,
                      padding: "0 10px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </SettingRow>

                <SettingRow label="Auto-generate flashcards" description="Create flashcards automatically when uploading PDFs">
                  <Toggle checked={autoGenerateFlashcards} onChange={setAutoGenerateFlashcards} />
                </SettingRow>

                <SettingRow label="Show explanations" description="Show detailed explanations after quiz answers" border={false}>
                  <Toggle checked={showExplanations} onChange={setShowExplanations} />
                </SettingRow>
              </div>
            </SectionCard>
          )}

          {/* ─── Notifications ─── */}
          {activeTab === "notifications" && (
            <SectionCard icon={Bell} title="Notifications" description="Choose what notifications you receive">
              <div>
                <SettingRow label="Quiz reminders" description="Get reminded to take your daily quizzes">
                  <Toggle checked={notifQuiz} onChange={setNotifQuiz} />
                </SettingRow>

                <SettingRow label="Study streak alerts" description="Notifications about your study streak">
                  <Toggle checked={notifStreak} onChange={setNotifStreak} />
                </SettingRow>

                <SettingRow label="Content ready" description="When AI finishes processing your uploads">
                  <Toggle checked={notifContent} onChange={setNotifContent} />
                </SettingRow>

                <SettingRow label="Email notifications" description="Receive weekly study progress reports via email" border={false}>
                  <Toggle checked={notifEmail} onChange={setNotifEmail} />
                </SettingRow>
              </div>
            </SectionCard>
          )}

          {/* ─── Danger Zone ─── */}
          {activeTab === "danger" && (
            <SectionCard icon={Shield} title="Danger Zone" description="Irreversible account actions" danger>
              {!showDeleteConfirm ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px",
                      borderRadius: "var(--r-md)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      background: "rgba(239,68,68,0.04)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>Delete Account</div>
                      <div style={{ fontSize: 12, color: "var(--vp-text-3)", marginTop: 2 }}>
                        Permanently delete your account and all data
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        height: 34,
                        padding: "0 16px",
                        borderRadius: "var(--r-full)",
                        fontSize: 13,
                        fontWeight: 500,
                        background: "rgba(239,68,68,0.1)",
                        color: "#EF4444",
                        border: "1px solid rgba(239,68,68,0.25)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Account
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: 20,
                    borderRadius: "var(--r-md)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                    <AlertTriangle size={20} style={{ color: "#EF4444", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>
                        Are you absolutely sure?
                      </div>
                      <p style={{ fontSize: 13, color: "var(--vp-text-2)", marginTop: 4, lineHeight: 1.5 }}>
                        This will permanently delete your account and all your data including lectures,
                        quizzes, flashcards, notes, and chat history. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, color: "#EF4444" }}>
                      Type <strong>DELETE</strong> to confirm
                    </label>
                    <input
                      className="vp-input"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      style={{
                        borderColor: "rgba(239,68,68,0.3)",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                      style={{
                        height: 36,
                        padding: "0 16px",
                        borderRadius: "var(--r-full)",
                        fontSize: 13,
                        fontWeight: 600,
                        background: deleteConfirmText === "DELETE" ? "#EF4444" : "rgba(239,68,68,0.2)",
                        color: "white",
                        border: "none",
                        cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                        opacity: deleteConfirmText === "DELETE" ? 1 : 0.5,
                      }}
                    >
                      {deleting ? (
                        <>
                          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          Deleting...
                        </>
                      ) : (
                        "Permanently Delete Account"
                      )}
                    </button>
                    <button
                      className="vp-btn vp-btn-ghost vp-btn-sm"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
