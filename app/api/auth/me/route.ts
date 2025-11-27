import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

// Mark route as dynamic and use Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('[AUTH ME] MONGODB_URI is not set');
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}



