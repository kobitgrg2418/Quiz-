import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Try to decode the session cookie
  const token = req.cookies.get("authjs.session-token")?.value;
  let isLoggedIn = false;

  if (token) {
    try {
      const decoded = await decode({
        token,
        secret: process.env.NEXTAUTH_SECRET!,
        salt: "authjs.session-token",
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
