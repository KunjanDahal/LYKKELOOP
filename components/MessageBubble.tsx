"use client";

import { MessageResponse } from "@/types";

interface MessageBubbleProps {
  message: MessageResponse;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Alignment logic:
  // - isOwnMessage = true: message sent by current viewer → right-aligned (justify-end), blue
  // - isOwnMessage = false: message received from other party → left-aligned (justify-start), beige
  // Using explicit inline styles to force alignment
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
    width: '100%',
    marginBottom: '0.75rem'
  };

  // Force the styles to ensure they're applied
  const bubbleStyle: React.CSSProperties = {
    maxWidth: '75%',
    flexShrink: 0,
    backgroundColor: isOwnMessage ? '#3B82F6' : '#F7EDE2', // Force blue or beige
    color: isOwnMessage ? '#FFFFFF' : '#8C6746', // Force white or brown
  };

  return (
    <div style={containerStyle}>
      <div
        className={`max-w-[75%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isOwnMessage
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-beige text-brown rounded-bl-sm"
        }`}
        style={bubbleStyle}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <span
          className={`mt-1.5 block text-[10px] ${
            isOwnMessage
              ? "text-white/70 text-right"
              : "text-brown/60 text-left"
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

