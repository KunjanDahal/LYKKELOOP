import { NextResponse } from "next/server";
import { getClearCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set("lykke_token", "", getClearCookieOptions());

  return response;
}

