import { NextResponse } from "next/server";
import { getClearAdminCookieOptions } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json(
    { message: "Admin logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("lykke_admin", "", getClearAdminCookieOptions());

  return response;
}


