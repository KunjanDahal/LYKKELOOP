import { NextResponse } from "next/server";
import { getClearCookieOptions } from "@/lib/auth";

// Mark route as dynamic and use Node.js runtime (required for cookies)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("lykke_token", "", getClearCookieOptions());

  return response;
}

