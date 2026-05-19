import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

// ── Brute-force / bot detection ─────────────────────────────────────────────
// Track rapid requests per IP in middleware (lightweight, edge-compatible)
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();
const MW_RATE_LIMIT = 100; // max requests per window
const MW_RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now - entry.windowStart > MW_RATE_WINDOW) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  return entry.count > MW_RATE_LIMIT;
}

// Clean up stale IP entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRequestCounts) {
    if (now - entry.windowStart > MW_RATE_WINDOW * 2) {
      ipRequestCounts.delete(ip);
    }
  }
}, 120_000);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // ── Global rate limiting at middleware level ────────────────────────────
  if (isRateLimited(ip)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  // ── Block suspicious paths (path traversal, probe attacks) ─────────────
  if (
    pathname.includes("..") ||
    pathname.includes("\\") ||
    /\.(php|asp|aspx|jsp|cgi|env|git|sql|bak|config)$/i.test(pathname)
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ── Block suspiciously large query strings (possible injection) ────────
  const queryString = req.nextUrl.search;
  if (queryString.length > 2048) {
    return new NextResponse("URI Too Long", { status: 414 });
  }

  // ── Auth check ─────────────────────────────────────────────────────────
  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const token = req.cookies.get(cookieName)?.value;
  let isLoggedIn = false;

  if (token) {
    try {
      const decoded = await decode({
        token,
        secret: process.env.NEXTAUTH_SECRET!,
        salt: cookieName,
      });
      isLoggedIn = !!decoded;
    } catch {
      isLoggedIn = false;
    }
  }

  const isPublic = publicRoutes.includes(pathname);
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // ── Additional security headers per-request ────────────────────────────
  response.headers.set("X-Request-Id", crypto.randomUUID());

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
