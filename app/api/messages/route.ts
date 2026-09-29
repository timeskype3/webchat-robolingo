import { randomUUID } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { messagingApi } from "@line/bot-sdk";

import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import {
  BaseMessageSchema,
  OutgoingMessageSchemaType,
  STATUS,
} from "@/types/api";
import { DIRECTION } from "@/types/message-shared";
import { getLineClient } from "@/lib/line";
import {
  createOutgoingMessage,
  markOutgoingAccepted,
  markOutgoingUnknown,
} from "@/lib/messages";

export async function POST(request: Request) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) {
    return Response.json(
      { status: "error", message: "Server configuration error" },
      { status: 500 },
    );
  }

  // Check authorization
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return Response.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 },
    );
  }

  let uid: string | null = null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    uid = decoded.uid;
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = BaseMessageSchema.pick({ userId: true, text: true }).safeParse(
    body,
  );

  if (!parsed.success) {
    return Response.json(
      { status: "error", message: "Invalid request body" },
      { status: 400 },
    );
  }

  // Check permission
  try {
    const adminSnapshot = await getAdminDb()
      .collection("admins")
      .doc(uid)
      .get();
    if (!adminSnapshot.exists || adminSnapshot.get("enabled") !== true) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return Response.json(
      { error: "Unable to verify admin permissions" },
      { status: 500 },
    );
  }

  const { userId, text } = parsed.data;
  const conversationRef = getAdminDb().collection("conversations").doc(userId);

  try {
    const conversation = await conversationRef.get();
    if (!conversation.exists) {
      return Response.json(
        { status: "error", message: "Conversation not found" },
        { status: 404 },
      );
    }
    const id = randomUUID();
    const sentAt = Timestamp.now();

    // Save to Firestore
    const messageData: OutgoingMessageSchemaType = {
      userId,
      text,
      direction: DIRECTION.OUTGOING,
      sentAt: sentAt,
      sentBy: uid,
      status: STATUS.PENDING,
    };
    await createOutgoingMessage({ id, message: messageData });

    // Send a message to LINE
    let lineResponse: messagingApi.PushMessageResponse;
    try {
      lineResponse = await getLineClient().pushMessage({
        to: userId,
        messages: [
          {
            type: "text",
            text,
          },
        ],
      });
    } catch {
      // Update message status (UNKNOWN)
      await markOutgoingUnknown(userId, id);
      return Response.json(
        { error: "Something went wrong with Line provider" },
        { status: 502 },
      );
    }
    // Update massage status (ACCEPTED)
    await markOutgoingAccepted(id, messageData, lineResponse.sentMessages[0]);

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { status: "error", message: "Failed to send a message" },
      { status: 500 },
    );
  }
}
