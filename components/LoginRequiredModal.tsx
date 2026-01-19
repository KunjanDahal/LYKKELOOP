"use client";

import { useEffect } from "react";
import Link from "next/link";

interface LoginRequiredModalProps {
  onClose: () => void;
}

export default function LoginRequiredModal({ onClose }: LoginRequiredModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brown/70 hover:text-brown transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-rose/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-rose"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brown mb-2">
              Enter your name to continue
            </h2>
            <p className="text-brown/70">
              We use name-only login so you can see your purchases and chat history.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Link
              href="/name-login"
              onClick={onClose}
              className="px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-center"
            >
              Enter Your Name
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

