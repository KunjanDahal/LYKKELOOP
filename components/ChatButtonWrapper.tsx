"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ChatButton from "./ChatButton";
import ChatPopup from "./ChatPopup";
import { useAuth } from "@/contexts/AuthContext";
import { useChatState } from "@/contexts/ChatStateContext";

function ChatButtonContent() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { isChatPopupOpen, setIsChatPopupOpen } = useChatState();

  // Check for openChat query param
  useEffect(() => {
    if (!loading && user && searchParams?.get("openChat") === "true") {
      setIsChatPopupOpen(true);
    }
  }, [loading, user, searchParams, setIsChatPopupOpen]);

  return (
    <>
      <ChatButton />
      {isChatPopupOpen && (
        <ChatPopup
          isOpen={isChatPopupOpen}
          onClose={() => {
            setIsChatPopupOpen(false);
          }}
        />
      )}
    </>
  );
}

export default function ChatButtonWrapper() {
  const pathname = usePathname();

  // Only show chat button on non-admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Suspense fallback={<ChatButton />}>
      <ChatButtonContent />
    </Suspense>
  );
}
