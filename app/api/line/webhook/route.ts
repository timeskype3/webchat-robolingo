import { Timestamp } from "firebase-admin/firestore";

import { verifyLineSignature } from "@/lib/line";
import {
  IncomingMessageSchemaType,
  WebhookEventSchema,
  WebhookMessageSchema,
} from "@/types/api";
import { DIRECTION } from "@/types/message-shared";
import { saveIncomingMessage } from "@/lib/messages";

function errorResponse(message: string, status: number) {
  return Response.json({ status: "error", message }, { status });
}

function parseWebhookBody(rawBody: string) {
  try {
    return WebhookMessageSchema.safeParse(JSON.parse(rawBody));
  } catch {
    return null;
  }
}

async function saveWebhookEvents(events: unknown[]) {
  for (const event of events) {
    const parsedEvent = WebhookEventSchema.safeParse(event);
    if (!parsedEvent.success) {
      console.warn("Invalid event structure:", event);
      continue;
    }

    const { data } = parsedEvent;
    const incomingMessage: IncomingMessageSchemaType = {
      eventId: data.webhookEventId,
      messageId: data.message.id,
      messageType: data.message.type,
      userId: data.source.userId,
      text: data.message.type === "text" ? data.message.text : "[Sticker]",
      sentAt: Timestamp.fromMillis(data.timestamp),
      direction: DIRECTION.INCOMING,
      ...(data.message.quoteToken
        ? { quoteToken: data.message.quoteToken }
        : {}),
      ...(data.message.quotedMessageId
        ? { quotedMessageId: data.message.quotedMessageId }
        : {}),
      ...(data.message.type === "sticker"
        ? {
            sticker: {
              packageId: data.message.packageId,
              stickerId: data.message.stickerId,
              resourceType: data.message.stickerResourceType,
            },
          }
        : {}),
    };

    await saveIncomingMessage(incomingMessage);
  }
}

export async function POST(request: Request) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    return errorResponse("Server configuration error", 500);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  // Verify signature
  if (!signature || !verifyLineSignature(rawBody, signature)) {
    return errorResponse(request.headers.get("x-line-signature") ?? "", 401);
  }

  const payload = parseWebhookBody(rawBody);
  if (!payload) {
    return errorResponse("Invalid JSON", 400);
  }

  if (!payload.success) {
    return errorResponse("Invalid webhook payload", 400);
  }

  try {
    await saveWebhookEvents(payload.data.events);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return errorResponse("Internal server error", 500);
  }
  return Response.json({ status: "ok" });
}
