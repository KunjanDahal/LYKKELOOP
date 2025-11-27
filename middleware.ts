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
  // Note: Protection is handled client-side in the page components
  // Middleware protection removed temporarily to fix cookie reading issues
  const protectedCategoryRoutes = ["/earrings", "/cap", "/glooves", "/keyring"];
  if (protectedCategoryRoutes.includes(pathname)) {
    // Allow access - client-side will handle redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/earrings", "/cap", "/glooves", "/keyring"],
};


