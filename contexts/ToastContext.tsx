"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "message";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  // For message toasts
  title?: string;
  onClick?: () => void;
  conversationId?: string;
  senderName?: string;
  buttonText?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  showMessageToast: (options: {
    title: string;
    message: string;
    onClick?: () => void;
    conversationId?: string;
    senderName?: string;
  }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const showMessageToast = (options: {
    title: string;
    message: string;
    onClick?: () => void;
    conversationId?: string;
    senderName?: string;
    buttonText?: string;
  }) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      id,
      message: options.message,
      type: "message",
      title: options.title,
      onClick: options.onClick,
      conversationId: options.conversationId,
      senderName: options.senderName,
      buttonText: options.buttonText,
    };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 8 seconds for message toasts
    setTimeout(() => {
      removeToast(id);
    }, 8000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, showMessageToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}



