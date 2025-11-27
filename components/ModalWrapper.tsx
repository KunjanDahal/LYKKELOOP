"use client";

import { useModal } from "@/contexts/ModalContext";
import LoginRequiredModal from "@/components/LoginRequiredModal";

export default function ModalWrapper() {
  const { isOpen, closeModal } = useModal();

  if (!isOpen) return null;

  return <LoginRequiredModal onClose={closeModal} />;
}



