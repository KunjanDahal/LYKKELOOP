import { NextRequest, NextResponse } from "next/server";
import { ADMIN_EMAIL, ADMIN_PASSWORD, getAdminCookieOptions } from "@/lib/adminAuth";

// Mark route as dynamic and use Node.js runtime (required for cookies)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check against hard-coded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create response
      const response = NextResponse.json(
        {
          message: "Admin login successful",
        },
        { status: 200 }
      );

      // Set admin cookie
      response.cookies.set("lykke_admin", "1", getAdminCookieOptions());

      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}


