import { Resend } from "resend";

// Lazy initialization of Resend instance
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }

  return resendInstance;
}

// Helper to check if Resend is configured
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// Get the domain from environment or default
function getDomain(): string {
  return (
    process.env.NEXT_PUBLIC_DOMAIN ||
    process.env.VERCEL_URL ||
    "localhost:3000"
  );
}

// Send message notification email
export async function sendMessageNotification(
  to: string,
  senderName: string,
  messageSnippet: string,
  conversationId: string,
  isAdminReceiver: boolean
): Promise<void> {
  if (!isEmailConfigured()) {
    console.log("[Email] Resend not configured, skipping email send");
    return;
  }

  try {
    const domain = getDomain();
    const protocol = domain.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${domain}`;

    const subject = isAdminReceiver
      ? `New message from ${senderName} — LykkeLoop`
      : "New reply from LykkeLoop";

    const conversationLink = isAdminReceiver
      ? `${baseUrl}/admin/messages?conversation=${conversationId}`
      : `${baseUrl}/?openChat=true`;

    const greeting = isAdminReceiver ? "Hello Admin," : `Hello ${senderName},`;

    // Truncate snippet to 120 characters
    const snippet =
      messageSnippet.length > 120
        ? messageSnippet.substring(0, 120) + "..."
        : messageSnippet;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8e8e5;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
            }
            .content {
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e5e5e5;
            }
            .message-snippet {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
              font-style: italic;
              border-left: 3px solid #e91e63;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #e91e63;
              color: white;
              text-decoration: none;
              border-radius: 24px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; color: #8b4513;">LYKKE LOOP</h1>
          </div>
          <div class="content">
            <p>${greeting}</p>
            <p>You have received a new message:</p>
            <div class="message-snippet">${snippet}</div>
            <p>
              <a href="${conversationLink}" class="button">View Conversation</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from LykkeLoop.</p>
          </div>
        </body>
      </html>
    `;

    const resend = getResend();
    if (!resend) {
      console.log("[Email] Resend not configured, skipping email send");
      return;
    }

    await resend.emails.send({
      from: "LykkeLoop <noreply@lykkeloop.dk>",
      to: [to],
      subject,
      html: htmlBody,
    });

    console.log(`[Email] Notification sent to ${to}`);
  } catch (error) {
    console.error("[Email] Error sending notification:", error);
    // Don't throw - email failures shouldn't break message creation
  }
}

