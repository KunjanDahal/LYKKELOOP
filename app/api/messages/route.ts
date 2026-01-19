import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { checkAdminAuth } from "@/lib/adminAuth";
import { publishMessageEvent } from "@/lib/pusher";
import { sendMessageNotification } from "@/lib/email";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// Simple rate limiting (in-memory, resets on serverless restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 messages per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || userLimit.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userLimit.count++;
  return true;
}

// POST - Create a new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication (both user and admin allowed)
    const isAdmin = await checkAdminAuth();
    const authUser = await getAuthUser();
    
    // Check if request is coming from admin site by checking referer header
    const referer = request.headers.get("referer") || "";
    const isFromAdminSite = referer.includes("/admin/");

    if (!isAdmin && !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const { conversationId, content, mediaType, mediaUrl } = body;

    // Validation
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Either content or media must be provided
    if ((!content || content.trim().length === 0) && !mediaUrl) {
      return NextResponse.json(
        { error: "Message content or media is required" },
        { status: 400 }
      );
    }

    if (content && content.length > 5000) {
      return NextResponse.json(
        { error: "Message content cannot exceed 5000 characters" },
        { status: 400 }
      );
    }

    // Validate media
    if (mediaUrl && !mediaType) {
      return NextResponse.json(
        { error: "Media type is required when media URL is provided" },
        { status: 400 }
      );
    }

    if (mediaType && !["image", "video"].includes(mediaType)) {
      return NextResponse.json(
        { error: "Invalid media type. Must be 'image' or 'video'" },
        { status: 400 }
      );
    }

    // Validate conversationId format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { error: "Invalid conversation ID format" },
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

    // Determine sender role and ID
    // Use request origin to determine sender role
    // - If request is from admin site (/admin/*) AND isAdmin is true → senderRole = "admin"
    // - If request is from user site AND authUser exists → senderRole = "user"
    // - Otherwise → senderRole = "user" (fallback)
    // This ensures: admins sending from admin site = "admin", users sending from user site = "user"
    const senderRole: "user" | "admin" = (isFromAdminSite && isAdmin) ? "admin" : "user";
    const senderId = (isFromAdminSite && isAdmin) ? null : authUser?.userId;

    // Authorization check
    if (!isAdmin) {
      // User can only send to their own conversation
      if (conversation.userId.toString() !== authUser?.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Rate limiting (only for users)
    if (!isAdmin && authUser) {
      if (!checkRateLimit(authUser.userId)) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait before sending more messages." },
          { status: 429 }
        );
      }
    }

    // Create message
    const message = await Message.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: senderId ? new mongoose.Types.ObjectId(senderId) : null,
      senderRole,
      content: content ? content.trim() : (mediaType === "image" ? "📷 Photo" : mediaType === "video" ? "🎥 Video" : ""),
      mediaType: mediaType || null,
      mediaUrl: mediaUrl || null,
    });

    // Update conversation
    const snippet = content ? content.trim().substring(0, 100) : (mediaType === "image" ? "📷 Photo" : mediaType === "video" ? "🎥 Video" : "");
    conversation.lastMessageSnippet = snippet;
    conversation.lastMessageAt = new Date();
    conversation.updatedAt = new Date();

    // Update unread counters
    if (senderRole === "user") {
      conversation.adminUnreadCount += 1;
    } else {
      conversation.userUnreadCount += 1;
    }

    await conversation.save();

    // Get sender name for notifications
    let senderName = "Admin";
    if (senderRole === "user" && authUser) {
      const user = await User.findById(authUser.userId).select("name").lean();
      senderName = user?.name || "User";
    }

    // Publish Pusher event
    if (senderRole === "user") {
      // Notify admin
      await publishMessageEvent(
        "admin-messages",
        "new-message",
        {
          conversationId: conversationId,
          message: {
            id: message._id.toString(),
            conversationId: message.conversationId.toString(),
            senderId: message.senderId?.toString() || null,
            senderRole: message.senderRole,
            content: message.content,
            createdAt: message.createdAt,
            readAt: message.readAt || null,
          },
          senderName,
          senderRole: message.senderRole,
        }
      );
    } else {
      // Notify user
      await publishMessageEvent(
        `user-${conversation.userId.toString()}-messages`,
        "new-message",
        {
          conversationId: conversationId,
          message: {
            id: message._id.toString(),
            conversationId: message.conversationId.toString(),
            senderId: message.senderId?.toString() || null,
            senderRole: message.senderRole,
            content: message.content,
            createdAt: message.createdAt,
            readAt: message.readAt || null,
          },
          senderName,
          senderRole: message.senderRole,
        }
      );
    }

    // Send email notifications
    try {
      if (senderRole === "user") {
        // User sends → email admin at dahalkunjan@gmail.com
        const user = await User.findById(authUser?.userId).select("name").lean();
        await sendMessageNotification(
          "dahalkunjan@gmail.com",
          user?.name || "User",
          content.trim(),
          conversationId,
          true // isAdminReceiver
        );
      } else {
        // Admin sends → email user
        const user = await User.findById(conversation.userId)
          .select("email name")
          .lean();
        if (user?.email) {
          await sendMessageNotification(
            user.email,
            senderName,
            content.trim(),
            conversationId,
            false // isAdminReceiver
          );
        }
      }
    } catch (emailError) {
      console.error("[Messages API] Email notification error:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId?.toString() || null,
      senderRole: message.senderRole,
      content: message.content,
      mediaType: (message as any).mediaType || null,
      mediaUrl: (message as any).mediaUrl || null,
      createdAt: message.createdAt,
      readAt: message.readAt || null,
    });
  } catch (error: any) {
    console.error("Create message error:", error);
    
    // Ensure we always return JSON
    const errorMessage = error?.message || error?.toString() || "Failed to create message";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

