import { NextResponse } from "next/server";
import { getClearAdminCookieOptions } from "@/lib/adminAuth";

// Mark route as dynamic and use Node.js runtime (required for cookies)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST() {
  const response = NextResponse.json(
    { message: "Admin logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("lykke_admin", "", getClearAdminCookieOptions());

  return response;
}


