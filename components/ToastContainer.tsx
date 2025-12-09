"use client";

import { useToast } from "@/contexts/ToastContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 sm:right-4 left-4 sm:left-auto z-50 space-y-2 max-w-sm w-auto sm:w-full px-0">
      {toasts.map((toast) => {
        // Message toast with special styling
        if (toast.type === "message") {
          return (
            <div
              key={toast.id}
              className="rounded-2xl bg-white shadow-lg border border-[#F7EDE2] p-3 flex flex-col gap-1 animate-in slide-in-from-right max-w-sm w-full"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#5C4630]">
                  {toast.title || "New message"}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-xs text-[#AA9070] hover:text-[#5C4630] transition-colors ml-2"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-[#7C6650] line-clamp-2">
                {toast.message}
              </p>
              {toast.onClick && (
                <button
                  onClick={() => {
                    toast.onClick?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 inline-flex self-start rounded-full px-3 py-1 text-xs font-medium bg-[#E3B7C8] text-white hover:bg-[#E3B7C8]/90 transition-colors"
                >
                  {toast.buttonText || "Open chat"}
                </button>
              )}
            </div>
          );
        }

        // Regular toasts (success, error, info)
        return (
          <div
            key={toast.id}
            className={`rounded-lg shadow-lg p-4 flex items-center justify-between animate-in slide-in-from-right ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : toast.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              {toast.type === "success" && (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {toast.type === "error" && (
                <svg
                  className="w-5 h-5 text-red-600"
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
              )}
              {toast.type === "info" && (
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
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
        );
      })}
    </div>
  );
}

