"use client";

import { useEffect, useRef } from "react";
import { getPusherClient, isPusherClientConfigured } from "@/lib/pusherClient";
import { MessageResponse } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChatState } from "@/contexts/ChatStateContext";
import { useRouter, usePathname } from "next/navigation";

interface UseGlobalMessageListenerOptions {
  isAdmin?: boolean;
  enabled?: boolean;
}

/**
 * Global message listener hook for user side
 * Listens for messages from admin and shows toast notifications
 */
export function useGlobalMessageListener({
  isAdmin = false,
  enabled = true,
}: UseGlobalMessageListenerOptions = {}) {
  const channelRef = useRef<any>(null);
  const { showMessageToast } = useToast();
  const { user } = useAuth();
  const { isChatPopupOpen, activeConversationId } = useChatState();
  const router = useRouter();
  const pathname = usePathname();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<Set<string>>(new Set());

  // Polling fallback to check for new messages - runs for users
  useEffect(() => {
    if (!enabled || isAdmin || !user?.id) {
      // Cleanup if disabled
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollForNewMessages = async () => {
      try {
        if (isAdmin) {
          // Admin: check conversations for new messages
          const response = await fetch("/api/conversations", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            const conversations = data.conversations || [];
            
            // Check each conversation for new messages
            for (const conv of conversations) {
              if (conv.adminUnreadCount > 0) {
                // Fetch conversation details to get latest message
                const convResponse = await fetch(
                  `/api/conversations/${conv.id}`,
                  { credentials: "include" }
                );
                if (convResponse.ok) {
                  const convData = await convResponse.json();
                  const messages = convData.messages || [];
                  if (messages.length > 0) {
                    const latestMessage = messages[messages.length - 1];
                    if (
                      latestMessage.senderRole === "user" &&
                      !lastMessageIdRef.current.has(latestMessage.id) &&
                      (pathname !== "/admin/messages" ||
                        activeConversationId !== conv.id)
                    ) {
                      lastMessageIdRef.current.add(latestMessage.id);
                      showMessageToast({
                        title: `New message from ${conv.user?.name || "User"}`,
                        message: latestMessage.content.substring(0, 80),
                        conversationId: conv.id,
                        senderName: conv.user?.name || "User",
                        buttonText: "View conversation",
                        onClick: () => {
                          router.push(`/admin/messages?conversation=${conv.id}`);
                        },
                      });
                    }
                  }
                }
              }
            }
          }
        } else {
          // User: check for unread messages
          const response = await fetch("/api/notifications/unread-count", {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            if (data.unreadCount > 0) {
              // Fetch conversation to get latest message
              const convResponse = await fetch("/api/conversations", {
                method: "POST",
                credentials: "include",
              });
              if (convResponse.ok) {
                const convData = await convResponse.json();
                const messagesResponse = await fetch(
                  `/api/conversations/${convData.id}`,
                  { credentials: "include" }
                );
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  const messages = messagesData.messages || [];
                  if (messages.length > 0) {
                    // Get the latest message from admin
                    const adminMessages = messages.filter(
                      (msg: MessageResponse) => msg.senderRole === "admin"
                    );
                    if (adminMessages.length > 0) {
                      const latestMessage =
                        adminMessages[adminMessages.length - 1];
                      if (
                        !lastMessageIdRef.current.has(latestMessage.id) &&
                        (!isChatPopupOpen ||
                          activeConversationId !== convData.id)
                      ) {
                        lastMessageIdRef.current.add(latestMessage.id);
                        showMessageToast({
                          title: "New message from LykkeLoop",
                          message: latestMessage.content.substring(0, 80),
                          conversationId: convData.id,
                          onClick: () => {
                            // Open chat popup - this will be handled by ChatButtonWrapper
                            router.push("/?openChat=true");
                          },
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to poll for new messages:", error);
      }
    };

    // Initial poll
    pollForNewMessages();

    // Poll every 10 seconds
    pollingIntervalRef.current = setInterval(pollForNewMessages, 10000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enabled, isAdmin, user?.id, isChatPopupOpen, activeConversationId, showMessageToast, router]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // For admin, we need admin auth check
    if (isAdmin) {
      // Admin listener will be handled separately
      return;
    }

    // For user, check if authenticated
    if (!user?.id) {
      return;
    }

    const pusherClient = getPusherClient();
    const isPusherConfigured = isPusherClientConfigured();

    // Use polling if Pusher is not configured
    if (!isPusherConfigured || !pusherClient) {
      // Polling is already started in the useEffect above
      return;
    }

    // If Pusher is configured, subscribe to real-time events
    // Polling will also run as a fallback
    const channelName = `user-${user.id}-messages`;
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    const handleNewMessage = (data: any) => {
      const { message, senderName, senderRole } = data;

      // Ensure message is properly formatted
      if (!message || !message.id) {
        console.error("[Global Listener] Invalid message format:", data);
        return;
      }

      // Only show toast for messages from admin
      if (senderRole !== "admin") {
        return;
      }

      // Check if message already processed
      if (lastMessageIdRef.current.has(message.id)) {
        return;
      }
      lastMessageIdRef.current.add(message.id);

      // Only show toast if chat is not open or different conversation
      if (
        !isChatPopupOpen ||
        activeConversationId !== message.conversationId
      ) {
        showMessageToast({
          title: "New message from LykkeLoop",
          message: message.content.substring(0, 80),
          conversationId: message.conversationId,
          onClick: () => {
            // Open chat popup
            router.push("/?openChat=true");
          },
        });
      }
    };

    channel.bind("new-message", handleNewMessage);

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind("new-message");
        if (pusherClient) {
          pusherClient.unsubscribe(`user-${user.id}-messages`);
        }
        channelRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [
    enabled,
    isAdmin,
    user?.id,
    isChatPopupOpen,
    activeConversationId,
    showMessageToast,
    router,
  ]);

  return null;
}

/**
 * Global message listener hook for admin side
 * Listens for messages from users and shows toast notifications
 */
export function useGlobalAdminMessageListener({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const channelRef = useRef<any>(null);
  const { showMessageToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<Set<string>>(new Set());
  const activeConversationIdRef = useRef<string | null>(null);

  // Update active conversation ID from URL
  useEffect(() => {
    if (pathname === "/admin/messages") {
      const urlParams = new URLSearchParams(window.location.search);
      activeConversationIdRef.current = urlParams.get("conversation");
    } else {
      activeConversationIdRef.current = null;
    }
  }, [pathname]);

  // Polling fallback
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const pollForNewMessages = async () => {
      try {
        const response = await fetch("/api/conversations", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const conversations = data.conversations || [];

          for (const conv of conversations) {
            if (conv.adminUnreadCount > 0) {
              const convResponse = await fetch(
                `/api/conversations/${conv.id}`,
                { credentials: "include" }
              );
              if (convResponse.ok) {
                const convData = await convResponse.json();
                const messages = convData.messages || [];
                if (messages.length > 0) {
                  const latestMessage = messages[messages.length - 1];
                  if (
                    latestMessage.senderRole === "user" &&
                    !lastMessageIdRef.current.has(latestMessage.id) &&
                    (pathname !== "/admin/messages" ||
                      activeConversationIdRef.current !== conv.id)
                  ) {
                    lastMessageIdRef.current.add(latestMessage.id);
                    showMessageToast({
                      title: `New message from ${conv.user?.name || "User"}`,
                      message: latestMessage.content.substring(0, 80),
                      conversationId: conv.id,
                      senderName: conv.user?.name || "User",
                      onClick: () => {
                        router.push(`/admin/messages?conversation=${conv.id}`);
                      },
                    });
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to poll for new messages:", error);
      }
    };

    pollForNewMessages();
    pollingIntervalRef.current = setInterval(pollForNewMessages, 10000);
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

    // Subscribe to admin messages channel
    const channelName = "admin-messages";
    const channel = pusherClient.subscribe(channelName);
    channelRef.current = channel;

    const handleNewMessage = (data: any) => {
      const { message, senderName, senderRole } = data;

      // Ensure message is properly formatted
      if (!message || !message.id) {
        console.error("[Admin Listener] Invalid message format:", data);
        return;
      }

      // Only show toast for messages from users
      if (senderRole !== "user") {
        return;
      }

      // Check if message already processed
      if (lastMessageIdRef.current.has(message.id)) {
        return;
      }
      lastMessageIdRef.current.add(message.id);

      // Only show toast if messages page is not open or different conversation
      if (
        pathname !== "/admin/messages" ||
        activeConversationIdRef.current !== message.conversationId
      ) {
                    showMessageToast({
                      title: `New message from ${senderName || "User"}`,
                      message: message.content.substring(0, 80),
                      conversationId: message.conversationId,
                      senderName: senderName || "User",
                      buttonText: "View conversation",
                      onClick: () => {
                        router.push(`/admin/messages?conversation=${message.conversationId}`);
                      },
                    });
      }
    };

    channel.bind("new-message", handleNewMessage);

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
  }, [enabled, pathname, showMessageToast, router]);

  return null;
}

