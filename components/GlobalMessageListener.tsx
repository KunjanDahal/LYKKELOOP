"use client";

import { useGlobalMessageListener } from "@/hooks/useGlobalMessageListener";
import { useAuth } from "@/contexts/AuthContext";

export default function GlobalMessageListener() {
  const { user } = useAuth();
  
  // Only enable listener if user is authenticated
  useGlobalMessageListener({
    isAdmin: false,
    enabled: !!user?.id,
  });

  return null;
}

