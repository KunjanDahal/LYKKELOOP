import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import { getAuthUser } from "@/lib/auth";
import { checkAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// GET - Get unread message count
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if admin
    const isAdmin = await checkAdminAuth();

    if (isAdmin) {
      // Admin: sum of adminUnreadCount from all conversations
      const conversations = await Conversation.find({}).select(
        "adminUnreadCount"
      );
      const unreadCount = conversations.reduce(
        (sum, conv) => sum + conv.adminUnreadCount,
        0
      );

      return NextResponse.json({
        unreadCount,
        role: "admin",
      });
    } else {
      // User: sum of userUnreadCount from their conversations
      const authUser = await getAuthUser();

      if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const conversations = await Conversation.find({
        userId: authUser.userId,
      }).select("userUnreadCount");

      const unreadCount = conversations.reduce(
        (sum, conv) => sum + conv.userUnreadCount,
        0
      );

      return NextResponse.json({
        unreadCount,
        role: "user",
      });
    }
  } catch (error: any) {
    console.error("Get unread count error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}


