import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { generateToken, getAuthCookieOptions } from "@/lib/auth";

// Mark route as dynamic and use Node.js runtime (required for MongoDB and bcrypt)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Ensure this is a route handler
export const maxDuration = 30;

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  // Log that the route is being hit
  console.log('[LOGIN API] POST request received');
  
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('[LOGIN API] MONGODB_URI is not set');
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    await connectDB();
    console.log('[LOGIN API] Database connected');

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const { email, password } = body;
    console.log('[LOGIN API] Request body received:', { email: email ? 'present' : 'missing', password: password ? 'present' : 'missing' });

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set("lykke_token", token, getAuthCookieOptions());

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods - return 405 for methods other than POST and OPTIONS
export async function GET() {
  return new NextResponse(
    JSON.stringify({ error: "Method not allowed. Use POST." }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}

