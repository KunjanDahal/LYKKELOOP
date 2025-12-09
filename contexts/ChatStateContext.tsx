"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatStateContextType {
  isChatPopupOpen: boolean;
  activeConversationId: string | null;
  setIsChatPopupOpen: (isOpen: boolean) => void;
  setActiveConversationId: (id: string | null) => void;
}

const ChatStateContext = createContext<ChatStateContextType | undefined>(undefined);

export function ChatStateProvider({ children }: { children: ReactNode }) {
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <ChatStateContext.Provider
      value={{
        isChatPopupOpen,
        activeConversationId,
        setIsChatPopupOpen,
        setActiveConversationId,
      }}
    >
      {children}
    </ChatStateContext.Provider>
  );
}

export function useChatState() {
  const context = useContext(ChatStateContext);
  if (context === undefined) {
    throw new Error("useChatState must be used within a ChatStateProvider");
  }
  return context;
}

