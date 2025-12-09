"use client";

import Pusher from "pusher-js";

// Client-side Pusher instance
let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (pusherClient) {
    return pusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2";

  if (!key) {
    console.log("[Pusher Client] Key not configured");
    return null;
  }

  pusherClient = new Pusher(key, {
    cluster,
    forceTLS: true,
  });

  return pusherClient;
}

// Check if Pusher is configured on client
export function isPusherClientConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_PUSHER_KEY;
}



