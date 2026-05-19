/**
 * Cybersecurity utilities for VivaPrep AI
 *
 * Covers: input sanitization, password strength validation,
 * request validation, and error sanitization.
 */

// ── Input Sanitization ──────────────────────────────────────────────────────

/** Strip HTML tags and dangerous characters to prevent XSS */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // strip angle brackets
    .replace(/javascript:/gi, "") // strip JS protocol
    .replace(/on\w+\s*=/gi, "") // strip inline event handlers
    .replace(/data:\s*text\/html/gi, "") // strip data:text/html
    .trim();
}

/** Sanitize and validate an email address */
export function sanitizeEmail(email: string): string | null {
  const cleaned = email.trim().toLowerCase();
  // RFC 5322 simplified — catches 99%+ of valid emails
  const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
  return EMAIL_RE.test(cleaned) ? cleaned : null;
}

/** Validate a UUID format (v4) */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Validate a CUID format (Prisma default IDs) */
export function isValidCUID(id: string): boolean {
  return /^c[a-z0-9]{24,}$/i.test(id);
}

/** Validate any ID format used by the app (UUID or CUID) */
export function isValidId(id: string): boolean {
  return isValidUUID(id) || isValidCUID(id);
}

// ── Password Strength ───────────────────────────────────────────────────────

export interface PasswordCheck {
  valid: boolean;
  errors: string[];
}

/** Enforce strong password requirements */
export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (password.length > 128) {
    errors.push("Password must be at most 128 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check for common weak passwords
  const COMMON_PASSWORDS = [
    "password", "12345678", "qwerty123", "abc12345",
    "letmein1", "welcome1", "monkey123", "dragon12",
    "master12", "admin123", "iloveyou", "trustno1",
  ];
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push("This password is too common. Choose something more unique");
  }

  return { valid: errors.length === 0, errors };
}

// ── Request Validation ──────────────────────────────────────────────────────

/** Maximum allowed JSON body size (100KB) to prevent DoS */
export const MAX_JSON_BODY_SIZE = 100 * 1024;

/** Safely parse JSON body with size check */
export async function safeParseJSON<T = Record<string, unknown>>(
  req: Request,
  maxSize = MAX_JSON_BODY_SIZE
): Promise<{ data: T | null; error: string | null }> {
  try {
    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > maxSize) {
      return { data: null, error: "Request body too large" };
    }

    const text = await req.text();
    if (text.length > maxSize) {
      return { data: null, error: "Request body too large" };
    }

    const data = JSON.parse(text) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: "Invalid JSON body" };
  }
}

// ── Error Sanitization ──────────────────────────────────────────────────────

/**
 * Create a safe error response that doesn't leak internal details.
 * In production, generic messages are returned; in dev, full errors pass through.
 */
export function safeError(
  error: unknown,
  publicMessage = "Internal server error"
): string {
  if (process.env.NODE_ENV === "development") {
    return error instanceof Error ? error.message : String(error);
  }
  // Never leak stack traces, SQL queries, or internal paths in production
  return publicMessage;
}

// ── Security Logging ────────────────────────────────────────────────────────

export interface SecurityEvent {
  type:
    | "auth_failure"
    | "rate_limit"
    | "invalid_input"
    | "suspicious_request"
    | "account_lockout";
  ip: string;
  userId?: string;
  details: string;
  timestamp: Date;
}

/** Log security-relevant events for monitoring */
export function logSecurityEvent(event: SecurityEvent): void {
  const entry = {
    ...event,
    timestamp: event.timestamp.toISOString(),
    level: "SECURITY",
  };
  // In production these go to Vercel logs → can be piped to a SIEM
  console.warn(`[SECURITY] ${event.type}:`, JSON.stringify(entry));
}

// ── Account Lockout ─────────────────────────────────────────────────────────

const failedAttempts = new Map<string, { count: number; firstAttempt: number }>();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** Check if an IP/account is locked out from too many failed attempts */
export function checkAccountLockout(key: string): {
  locked: boolean;
  remainingSeconds: number;
} {
  const entry = failedAttempts.get(key);
  if (!entry) return { locked: false, remainingSeconds: 0 };

  const now = Date.now();

  // Reset if outside the window
  if (now - entry.firstAttempt > LOCKOUT_WINDOW_MS + LOCKOUT_DURATION_MS) {
    failedAttempts.delete(key);
    return { locked: false, remainingSeconds: 0 };
  }

  if (entry.count >= LOCKOUT_THRESHOLD) {
    const lockoutEnd = entry.firstAttempt + LOCKOUT_WINDOW_MS + LOCKOUT_DURATION_MS;
    const remaining = Math.ceil((lockoutEnd - now) / 1000);
    if (remaining > 0) {
      return { locked: true, remainingSeconds: remaining };
    }
    // Lockout expired
    failedAttempts.delete(key);
  }

  return { locked: false, remainingSeconds: 0 };
}

/** Record a failed authentication attempt */
export function recordFailedAttempt(key: string, ip: string): void {
  const entry = failedAttempts.get(key) || {
    count: 0,
    firstAttempt: Date.now(),
  };

  entry.count++;
  failedAttempts.set(key, entry);

  if (entry.count >= LOCKOUT_THRESHOLD) {
    logSecurityEvent({
      type: "account_lockout",
      ip,
      details: `Account locked after ${entry.count} failed attempts (key: ${key})`,
      timestamp: new Date(),
    });
  }
}

/** Reset failed attempts after successful login */
export function resetFailedAttempts(key: string): void {
  failedAttempts.delete(key);
}

// Clean up stale lockout entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = LOCKOUT_WINDOW_MS + LOCKOUT_DURATION_MS;
  for (const [key, entry] of failedAttempts) {
    if (now - entry.firstAttempt > maxAge) {
      failedAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);
