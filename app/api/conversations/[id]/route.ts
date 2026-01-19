import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthUser } from "@/lib/auth";
import { checkAdminAuth } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// GET - Get conversation with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isAdmin = await checkAdminAuth();
    const authUser = await getAuthUser();

    if (!isAdmin) {
      if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // User can only access their own conversation
      if (conversation.userId.toString() !== authUser.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get messages (paginated, limit 50, sorted by createdAt desc)
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    return NextResponse.json({
      id: conversation._id.toString(),
      userId: conversation.userId.toString(),
      adminId: conversation.adminId?.toString() || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessageSnippet: conversation.lastMessageSnippet,
      lastMessageAt: conversation.lastMessageAt,
      userUnreadCount: conversation.userUnreadCount,
      adminUnreadCount: conversation.adminUnreadCount,
      messages: messages.map((msg) => {
        return {
          id: msg._id.toString(),
          conversationId: msg.conversationId.toString(),
          senderId: msg.senderId?.toString() || null,
          senderRole: msg.senderRole,
          content: msg.content,
          mediaType: (msg as any).mediaType || null,
          mediaUrl: (msg as any).mediaUrl || null,
          createdAt: msg.createdAt,
          readAt: msg.readAt || null,
        };
      }),
    });
  } catch (error: any) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}


