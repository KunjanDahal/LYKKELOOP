import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { checkAdminAuth } from "@/lib/adminAuth";

// PATCH - Update user (name, optionally email)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { name, email } = body;

    // Validation
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (email !== undefined) {
      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json(
          { error: "Valid email is required" },
          { status: 400 }
        );
      }

      // Check if email is already in use by another user
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase().trim();
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}


