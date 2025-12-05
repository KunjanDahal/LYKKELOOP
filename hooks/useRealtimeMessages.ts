"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient, isPusherClientConfigured } from "@/lib/pusherClient";
import { MessageResponse } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

interface UseRealtimeMessagesOptions {
  conversationId?: string;
  userId?: string;
  isAdmin?: boolean;
  onNewMessage?: (message: MessageResponse, senderName: string) => void;
  enabled?: boolean;
}

export function useRealtimeMessages({
  conversationId,
  userId,
  isAdmin = false,
  onNewMessage,
  enabled = true,
}: UseRealtimeMessagesOptions) {
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);
  const { showToast } = useToast();
  const { user } = useAuth();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch unread count (used for polling fallback)
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications/unread-count", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Polling fallback when Pusher is not configured
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Initial fetch
    fetchUnreadCount();

    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 10000);
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const pusherClient = getPusherClient();
    const isPusherConfigured = isPusherClientConfigured();

    // Use polling if Pusher is not configured
    if (!isPusherConfigured || !pusherClient) {
      startPolling();
      return;
    }

    // Determine channel name
    let channelName: string;
    if (isAdmin) {
      channelName = "admin-messages";
    } else if (userId) {
      channelName = `user-${userId}-messages`;
    } else {
      // Fallback to polling if no userId
      startPolling();
      return;
    }

    // Subscribe to channel
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    const handleNewMessage = (data: any) => {
      const { message, senderName, senderRole } = data;

      // Ensure message is properly formatted
      if (!message || !message.id) {
        console.error("[Realtime] Invalid message format:", data);
        return;
      }

      // Update unread count
      fetchUnreadCount();

      // Call custom handler if provided
      if (onNewMessage) {
        onNewMessage(message, senderName || "User");
      } else {
        // Default: show toast if conversation not open or different conversation
        if (!conversationId || message.conversationId !== conversationId) {
          const toastMessage =
            senderRole === "admin"
              ? `New message from LykkeLoop`
              : `New message from ${senderName}`;
          showToast(toastMessage, "info");
        }
      }
    };

    channel.bind("new-message", handleNewMessage);

    // Initial unread count fetch
    fetchUnreadCount();

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind("new-message");
        pusherClient.unsubscribe(channelName);
        channelRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, isAdmin, userId, conversationId, onNewMessage, showToast]);

  return { unreadCount };
}

