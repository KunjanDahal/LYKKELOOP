import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getAuthUser } from "@/lib/auth";
import { checkAdminAuth } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// PATCH - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const isAdmin = await checkAdminAuth();
    const authUser = await getAuthUser();

    if (!isAdmin && !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Authorization check
    if (!isAdmin) {
      // User can only mark messages in their own conversation
      if (conversation.userId.toString() !== authUser?.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Determine which role is marking as read
    const readerRole: "user" | "admin" = isAdmin ? "admin" : "user";

    // Mark unread messages as read
    const now = new Date();
    const updateQuery: any = {
      conversationId: new mongoose.Types.ObjectId(conversationId),
      readAt: null,
    };

    // Only mark messages from the opposite role as read
    if (readerRole === "user") {
      // User is reading → mark admin messages as read
      updateQuery.senderRole = "admin";
    } else {
      // Admin is reading → mark user messages as read
      updateQuery.senderRole = "user";
    }

    await Message.updateMany(updateQuery, {
      $set: { readAt: now },
    });

    // Reset appropriate unread counter
    if (readerRole === "user") {
      conversation.userUnreadCount = 0;
    } else {
      conversation.adminUnreadCount = 0;
    }

    await conversation.save();

    return NextResponse.json({
      message: "Messages marked as read",
      conversationId: conversationId,
    });
  } catch (error: any) {
    console.error("Mark messages as read error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}


