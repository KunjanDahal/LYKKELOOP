"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ChatButton from "./ChatButton";
import ChatPopup from "./ChatPopup";
import { useAuth } from "@/contexts/AuthContext";

function ChatButtonContent() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [shouldOpenChat, setShouldOpenChat] = useState(false);

  // Check for openChat query param
  useEffect(() => {
    if (!loading && user && searchParams?.get("openChat") === "true") {
      setShouldOpenChat(true);
    }
  }, [loading, user, searchParams]);

  return (
    <>
      <ChatButton />
      {shouldOpenChat && (
        <ChatPopup
          isOpen={shouldOpenChat}
          onClose={() => setShouldOpenChat(false)}
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
