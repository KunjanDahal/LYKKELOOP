"use client";

import { useGlobalMessageListener } from "@/hooks/useGlobalMessageListener";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function GlobalMessageListener() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      console.log("[GlobalMessageListener] User state:", {
        hasUser: !!user,
        userId: user?.id,
        enabled: !!user?.id,
      });
    }
  }, [user, loading]);
  
  // Only enable listener if user is authenticated
  useGlobalMessageListener({
    isAdmin: false,
    enabled: !!user?.id && !loading,
  });

  return null;
}

