"use client";

import { useState, useEffect, useRef } from "react";
import { MessageResponse, ConversationResponse } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useToast } from "@/contexts/ToastContext";
import { useChatState } from "@/contexts/ChatStateContext";
import MessageBubble from "./MessageBubble";

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setIsChatPopupOpen, setActiveConversationId } = useChatState();

  // Scroll to bottom when messages change, conversation changes, or popup opens
  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen, conversationId]);

  // Initialize conversation when popup opens
  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    const initializeConversation = async () => {
      setLoading(true);
      try {
        // Get or create conversation
        const convResponse = await fetch("/api/conversations", {
          method: "POST",
          credentials: "include",
        });

        if (!convResponse.ok) {
          throw new Error("Failed to initialize conversation");
        }

        const convData: ConversationResponse = await convResponse.json();
        setConversationId(convData.id);
        setActiveConversationId(convData.id);

        // Fetch messages
        const messagesResponse = await fetch(
          `/api/conversations/${convData.id}`,
          {
            credentials: "include",
          }
        );

        if (messagesResponse.ok) {
          const messagesData: ConversationResponse & {
            messages: MessageResponse[];
          } = await messagesResponse.json();
          setMessages(messagesData.messages || []);
        }

        // Mark messages as read
        await fetch("/api/messages/read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convData.id }),
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        showToast("Failed to load chat", "error");
      } finally {
        setLoading(false);
      }
    };

    initializeConversation();
  }, [isOpen, user, showToast, setActiveConversationId]);

  // Sync chat state with context
  useEffect(() => {
    setIsChatPopupOpen(isOpen);
    if (!isOpen) {
      setActiveConversationId(null);
    }
  }, [isOpen, setIsChatPopupOpen, setActiveConversationId]);

  // Handle new message from real-time
  const handleNewMessage = (message: MessageResponse, senderName: string) => {
    if (message.conversationId === conversationId) {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          return prev;
        }
        // Sort messages by createdAt to ensure correct order
        const allMessages = [...prev, message].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return allMessages;
      });
      setTimeout(() => scrollToBottom(), 150);
    }
  };

  // Subscribe to real-time updates
  useRealtimeMessages({
    conversationId: conversationId || undefined,
    userId: user?.id,
    isAdmin: false,
    onNewMessage: handleNewMessage,
    enabled: isOpen && !!conversationId,
  });

  // Polling fallback to fetch new messages when Pusher might not be working
  useEffect(() => {
    if (!isOpen || !conversationId) {
      return;
    }

    const pollForNewMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data: ConversationResponse & {
            messages: MessageResponse[];
          } = await response.json();
          
          if (data.messages && data.messages.length > 0) {
            setMessages((prev) => {
              // Merge messages, keeping existing ones and adding new ones
              const existingIds = new Set(prev.map((msg) => msg.id));
              const newMessages = data.messages.filter(
                (msg) => !existingIds.has(msg.id)
              );
              
              if (newMessages.length > 0) {
                // Sort all messages by createdAt
                const allMessages = [...prev, ...newMessages].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
                setTimeout(() => scrollToBottom(), 150);
                return allMessages;
              }
              
              return prev;
            });
          }
        }
      } catch (error) {
        console.error("Failed to poll for new messages:", error);
      }
    };

    // Poll every 5 seconds when chat is open
    const pollInterval = setInterval(pollForNewMessages, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isOpen, conversationId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId || sending) {
      return;
    }

    const content = inputValue.trim();
    setInputValue("");
    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      const newMessage: MessageResponse = await response.json();
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates from real-time
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) {
          return prev;
        }
        // Sort messages by createdAt to ensure correct order
        const allMessages = [...prev, newMessage].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return allMessages;
      });
      // Scroll after state update
      setTimeout(() => scrollToBottom(), 150);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      showToast(error.message || "Failed to send message", "error");
      setInputValue(content); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay for mobile - click to close */}
      <div
        className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popup container with responsive positioning */}
      <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-end sm:justify-end pointer-events-none">
        <div
          className="
            pointer-events-auto
            bg-white shadow-2xl
            rounded-t-3xl sm:rounded-3xl
            border border-brown/10
            flex flex-col
            w-full max-w-full
            h-[70vh] max-h-[80vh]
            sm:h-[85vh] sm:max-h-[90vh]
            sm:max-w-md sm:w-[360px]
            lg:max-w-lg lg:w-[420px]
            sm:mr-4 sm:mb-4
            sm:mt-4
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-brown/10 bg-rose/5 rounded-t-3xl sm:rounded-t-3xl">
            <h3 className="font-semibold text-brown">Chat with LykkeLoop</h3>
            <button
              onClick={onClose}
              className="text-brown/60 hover:text-brown transition-colors"
              aria-label="Close chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
            {loading ? (
              <div className="text-center text-brown/60 py-8">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-brown/60 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="flex flex-col">
                {messages.map((message) => {
                // Determine if message is from current user (the logged-in user viewing this chat)
                // On user site:
                // - User's own messages: blue background, right-aligned
                // - Admin's messages (received): beige background, left-aligned
                // User sends message → senderRole = "user" → isOwnMessage = true → blue, right
                // Admin sends message → senderRole = "admin" → isOwnMessage = false → beige, left
                const isOwnMessage = message.senderRole === "user";

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={isOwnMessage}
                  />
                );
              })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-brown/10 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm sm:text-base border border-brown/20 rounded-full focus:outline-none focus:border-rose text-brown placeholder-brown/50"
                disabled={sending || !conversationId}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sending || !conversationId}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-rose text-white rounded-full hover:bg-rose/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex-shrink-0"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
      </div>
    </div>
    </>
  );
}

