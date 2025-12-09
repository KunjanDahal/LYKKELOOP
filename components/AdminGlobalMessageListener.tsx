"use client";

import { useGlobalAdminMessageListener } from "@/hooks/useGlobalMessageListener";
import { useEffect, useState } from "react";

export default function AdminGlobalMessageListener() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if admin is authenticated by checking for cookie
  useEffect(() => {
    const checkAuth = () => {
      // Check if we're on admin pages (not login page)
      const pathname = window.location.pathname;
      if (pathname !== "/admin/login") {
        // Simple check - if we can access admin pages, assume authenticated
        // The actual auth check happens server-side
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  useGlobalAdminMessageListener({
    enabled: isAuthenticated,
  });

  return null;
}

