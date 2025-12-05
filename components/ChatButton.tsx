"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ChatPopup from "./ChatPopup";

export default function ChatButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (loading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    setIsPopupOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          fixed z-50 w-14 h-14 bg-rose hover:bg-rose/90 text-white rounded-full 
          shadow-lg hover:shadow-xl transition-all duration-200 
          flex items-center justify-center group
          bottom-4 right-4
          sm:bottom-4 sm:right-4
          ${isPopupOpen ? 'hidden sm:flex' : 'flex'}
        `}
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {isPopupOpen && (
        <ChatPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
}

