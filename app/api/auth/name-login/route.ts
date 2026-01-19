import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User, { fixEmailIndex } from "@/models/User";
import { generateToken, getAuthCookieOptions } from "@/lib/auth";

// Mark route as dynamic and use Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
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

// Helper function to find or create user with name
// If name exists, log in to existing account (no multiple accounts per name)
async function findOrCreateUserWithName(baseName: string) {
  await connectDB();
  
  // Trim and clean the name
  const cleanName = baseName.trim();
  
  if (!cleanName || cleanName.length === 0) {
    throw new Error("Name is required");
  }
  
  // Check if exact name exists
  let existingUser = await User.findOne({ name: cleanName });
  
  if (existingUser) {
    // Name exists, return the existing user (log in to same account)
    return existingUser;
  } else {
    // Name doesn't exist, create with original name (only name field, no email/password)
    const userData: { name: string } = {
      name: cleanName,
    };
    const newUser = await User.create(userData);
    
    return newUser;
  }
}

export async function POST(request: NextRequest) {
  console.log('[NAME LOGIN API] POST request received');
  
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('[NAME LOGIN API] MONGODB_URI is not set');
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Find or create user (if name exists, log in to existing account)
    let user;
    try {
      user = await findOrCreateUserWithName(name);
    } catch (error: any) {
      // Handle duplicate key error for email: null
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        console.log('[NAME LOGIN API] Duplicate email index error detected. Fixing index...');
        
        // Fix the index to be sparse (allows multiple null values)
        await fixEmailIndex();
        
        // Retry creating the user
        try {
          user = await findOrCreateUserWithName(name);
          console.log('[NAME LOGIN API] User created successfully after index fix');
        } catch (retryError: any) {
          console.error('[NAME LOGIN API] Retry failed after index fix:', retryError);
          return NextResponse.json(
            { error: "Failed to create user. Please try again." },
            { status: 500 }
          );
        }
      } else {
        // Re-throw other errors
        throw error;
      }
    }

    // Generate JWT (email is optional now)
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email, // Will be undefined for name-only users
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email || null,
        },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set("lykke_token", token, getAuthCookieOptions());

    return response;
  } catch (error: any) {
    console.error("Name login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
