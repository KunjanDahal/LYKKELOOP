// Server-only admin authentication constants
// DO NOT expose these to the client

import { cookies } from "next/headers";

export const ADMIN_EMAIL = "admin@lykkeloop.dk";
export const ADMIN_PASSWORD = "SomeStrongPassword123";

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  };
}

export function getClearAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("lykke_admin");
    return adminCookie?.value === "1";
  } catch (error) {
    return false;
  }
}
