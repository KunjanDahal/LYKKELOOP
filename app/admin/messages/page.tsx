"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationResponse, MessageResponse } from "@/types";
import { useToast } from "@/contexts/ToastContext";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import MessageBubble from "@/components/MessageBubble";

function AdminMessagesContent() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  // Scroll to bottom when messages change, conversation changes, or component mounts
  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0 && selectedConversationId) {
      scrollToBottom();
    }
  }, [messages, selectedConversationId]);

  // Check URL params for conversation
  useEffect(() => {
    const convId = searchParams?.get("conversation");
    if (convId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === convId);
      if (conv) {
        setSelectedConversationId(convId);
      }
    }
  }, [searchParams, conversations]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/conversations", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        const conversationsList: ConversationResponse[] = data.conversations || [];
        setConversations(conversationsList);

        // Auto-select first conversation if URL param not set and no selection exists
        const urlConvId = searchParams?.get("conversation");
        if (!selectedConversationId && conversationsList.length > 0) {
          const convId = urlConvId || conversationsList[0].id;
          setSelectedConversationId(convId);
        } else if (urlConvId && conversationsList.some((c: ConversationResponse) => c.id === urlConvId)) {
          // If URL has a conversation ID and it exists, select it
          setSelectedConversationId(urlConvId);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        showToast("Failed to load conversations", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [showToast, selectedConversationId, searchParams]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const response = await fetch(
          `/api/conversations/${selectedConversationId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data: ConversationResponse & { messages: MessageResponse[] } =
          await response.json();
        const messagesList = data.messages || [];
        // Sort messages by createdAt to ensure correct order
        const sortedMessages = [...messagesList].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);

        // Mark messages as read
        await fetch("/api/messages/read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: selectedConversationId }),
          credentials: "include",
        });

        // Update conversation in list (clear admin unread)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversationId
              ? { ...conv, adminUnreadCount: 0 }
              : conv
          )
        );

        // Scroll to bottom after messages load
        setTimeout(() => scrollToBottom(), 200);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        showToast("Failed to load messages", "error");
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversationId, showToast]);

  // Handle new message from real-time
  const handleNewMessage = (message: MessageResponse, senderName: string) => {
    if (message.conversationId === selectedConversationId) {
      // Append to current conversation, checking for duplicates
      setMessages((prev) => {
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
    } else {
      // Show toast and update conversation list
      showToast(`New message from ${senderName}`, "info");
      
      // Refresh conversations to update unread counts and last message
      fetch("/api/conversations", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.conversations) {
            // Sort by lastMessageAt descending
            const sorted = [...data.conversations].sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime()
            );
            setConversations(sorted);
          }
        })
        .catch(console.error);
    }
  };

  // Subscribe to real-time updates
  useRealtimeMessages({
    conversationId: selectedConversationId || undefined,
    isAdmin: true,
    onNewMessage: handleNewMessage,
    enabled: true,
  });

  // Polling fallback to fetch new messages when Pusher might not be working
  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const pollForNewMessages = async () => {
      try {
        const response = await fetch(
          `/api/conversations/${selectedConversationId}`,
          {
            credentials: "include",
          }
        );

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

    // Poll every 5 seconds when conversation is selected
    const pollInterval = setInterval(pollForNewMessages, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [selectedConversationId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedConversationId || sending) {
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
          conversationId: selectedConversationId,
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
      setTimeout(() => scrollToBottom(), 150);

      // Update conversation list
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                lastMessageSnippet: content.substring(0, 100),
                lastMessageAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : conv
        );
        // Re-sort by lastMessageAt to bring updated conversation to top
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime()
        );
      });
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

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col lg:flex-row gap-4">
      {/* Left Panel - Conversation List */}
      <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md border border-brown/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-brown/10 bg-rose/5">
          <h2 className="text-xl font-semibold text-brown">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-brown/60">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-brown/60">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y divide-brown/10">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full text-left p-4 hover:bg-brown/5 transition-colors ${
                    selectedConversationId === conv.id ? "bg-rose/10" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brown truncate">
                        {conv.user?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-brown/60 truncate">
                        {conv.user?.email || ""}
                      </p>
                    </div>
                    {conv.adminUnreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-rose text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.adminUnreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessageSnippet && (
                    <p className="text-sm text-brown/70 truncate mt-1">
                      {conv.lastMessageSnippet}
                    </p>
                  )}
                  <p className="text-xs text-brown/50 mt-1">
                    {(() => {
                      const date = new Date(conv.lastMessageAt);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return "Just now";
                      if (diffMins < 60) return `${diffMins}m ago`;
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays < 7) return `${diffDays}d ago`;
                      return date.toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
                      });
                    })()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Thread */}
      <div className="flex-1 w-full lg:w-auto bg-white rounded-lg shadow-md border border-brown/10 overflow-hidden flex flex-col min-h-0">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-brown/10 bg-rose/5">
              <h3 className="font-semibold text-brown">
                {selectedConversation.user?.name || "Unknown User"}
              </h3>
              <p className="text-sm text-brown/60">
                {selectedConversation.user?.email || ""}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
              {messagesLoading ? (
                <div className="text-center text-brown/60 py-8">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-brown/60 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="flex flex-col">
                  {messages.map((message) => {
                  // Determine if message is from current user (the admin viewing this chat)
                  // On admin site: 
                  // - Admin's own messages: blue background, right-aligned
                  // - User's messages (received): beige background, left-aligned
                  // Admin sends message → senderRole = "admin" → isOwnMessage = true → blue, right
                  // User sends message → senderRole = "user" → isOwnMessage = false → beige, left
                  const isOwnMessage = message.senderRole === "admin";

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
            <div className="p-4 border-t border-brown/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-brown/20 rounded-full focus:outline-none focus:border-rose text-brown placeholder-brown/50"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending}
                  className="px-6 py-2 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-brown/60">Select a conversation to start</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<div className="text-center text-brown/60 py-12">Loading...</div>}>
      <AdminMessagesContent />
    </Suspense>
  );
}

