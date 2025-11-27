import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin")) {
    // Allow access to /admin/login
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for admin cookie
    const adminCookie = request.cookies.get("lykke_admin");

    // If no admin cookie, redirect to admin login
    if (!adminCookie || adminCookie.value !== "1") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect category routes (earrings, cap, glooves, keyring)
  const protectedCategoryRoutes = ["/earrings", "/cap", "/glooves", "/keyring"];
  if (protectedCategoryRoutes.includes(pathname)) {
    // Check for user auth token
    const authToken = request.cookies.get("lykke_token")?.value;

    // If no token or invalid token, redirect to login
    if (!authToken || !verifyToken(authToken)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/earrings", "/cap", "/glooves", "/keyring"],
};


