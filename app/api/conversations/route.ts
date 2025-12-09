import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { checkAdminAuth } from "@/lib/adminAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// POST - Create or get user's active conversation
// Ensures exactly one conversation per user
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userIdObj = new mongoose.Types.ObjectId(authUser.userId);
    
    // Find existing conversation for this user (should be only one)
    let conversation = await Conversation.findOne({
      userId: userIdObj,
    }).sort({ createdAt: 1 }); // Get the oldest one (first created)

    if (!conversation) {
      // Create new conversation if none exists
      conversation = await Conversation.create({
        userId: userIdObj,
        lastMessageSnippet: "",
        lastMessageAt: new Date(),
        userUnreadCount: 0,
        adminUnreadCount: 0,
      });
    }

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
    });
  } catch (error: any) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create conversation" },
      { status: 500 }
    );
  }
}

// GET - List conversations (user sees their own, admin sees all)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if admin
    const isAdmin = await checkAdminAuth();

    if (isAdmin) {
      // Admin: get all conversations with user info
      // Group by userId to ensure only one conversation per user (take the most recent one)
      const allConversations = await Conversation.find({})
        .populate("userId", "name email")
        .sort({ updatedAt: -1 })
        .lean();

      // Group by userId and keep only the most recent conversation per user
      const conversationMap = new Map<string, any>();
      for (const conv of allConversations) {
        const userId = typeof conv.userId === 'object' && conv.userId !== null
          ? (conv.userId as any)._id?.toString() || (conv.userId as any).toString()
          : String(conv.userId);
        
        // If we haven't seen this user yet, or this conversation is more recent, keep it
        if (!conversationMap.has(userId)) {
          conversationMap.set(userId, conv);
        } else {
          const existing = conversationMap.get(userId);
          const existingTime = new Date(existing.updatedAt || existing.lastMessageAt).getTime();
          const currentTime = new Date(conv.updatedAt || conv.lastMessageAt).getTime();
          if (currentTime > existingTime) {
            conversationMap.set(userId, conv);
          }
        }
      }

      // Convert map to array and sort by lastMessageAt
      const uniqueConversations = Array.from(conversationMap.values())
        .sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
          const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
          return timeB - timeA;
        });

      return NextResponse.json({
        conversations: uniqueConversations.map((conv: any) => ({
          id: conv._id.toString(),
          userId: typeof conv.userId === 'object' ? conv.userId._id.toString() : conv.userId.toString(),
          adminId: conv.adminId?.toString() || null,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          lastMessageSnippet: conv.lastMessageSnippet,
          lastMessageAt: conv.lastMessageAt,
          userUnreadCount: conv.userUnreadCount,
          adminUnreadCount: conv.adminUnreadCount,
          user: typeof conv.userId === 'object' && conv.userId ? {
            id: conv.userId._id.toString(),
            name: conv.userId.name,
            email: conv.userId.email,
          } : undefined,
        })),
      });
    } else {
      // User: get their own conversations
      const authUser = await getAuthUser();

      if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userIdObj = new mongoose.Types.ObjectId(authUser.userId);
      const conversations = await Conversation.find({
        userId: userIdObj,
      })
        .sort({ updatedAt: -1 })
        .lean();

      return NextResponse.json({
        conversations: conversations.map((conv) => ({
          id: conv._id.toString(),
          userId: conv.userId.toString(),
          adminId: conv.adminId?.toString() || null,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          lastMessageSnippet: conv.lastMessageSnippet,
          lastMessageAt: conv.lastMessageAt,
          userUnreadCount: conv.userUnreadCount,
          adminUnreadCount: conv.adminUnreadCount,
        })),
      });
    }
  } catch (error: any) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

