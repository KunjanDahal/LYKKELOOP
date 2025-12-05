import Pusher from "pusher";

// Lazy initialization of Pusher instance
let pusherInstance: Pusher | null = null;

// Helper to check if Pusher is configured
export function isPusherConfigured(): boolean {
  return !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET
  );
}

// Get Pusher instance (lazy initialization)
function getPusher(): Pusher | null {
  if (!isPusherConfigured()) {
    return null;
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || "us2",
      useTLS: true,
    });
  }

  return pusherInstance;
}

// Publish message event
export async function publishMessageEvent(
  channel: string,
  event: string,
  data: any
): Promise<void> {
  if (!isPusherConfigured()) {
    console.log("[Pusher] Not configured, skipping event publish");
    return;
  }

  try {
    const pusher = getPusher();
    if (pusher) {
      await pusher.trigger(channel, event, data);
    }
  } catch (error) {
    console.error("[Pusher] Error publishing event:", error);
  }
}

