import "server-only";
import {
  FieldValue,
  Timestamp,
  type DocumentReference,
  type Transaction,
} from "firebase-admin/firestore";
import { differenceInHours } from "date-fns";

import {
  DirectionType,
  IncomingMessageSchemaType,
  MessageSchemaType,
  OutgoingMessageSchemaType,
  STATUS,
} from "@/types/api";
import { DIRECTION, LineProfile } from "@/types/message-shared";
import { getAdminDb } from "./firebase-admin";
import { getProfile } from "./line";

function getConversationRef(userId: string) {
  return getAdminDb().collection("conversations").doc(userId);
}

async function updateLastMessage(input: {
  transaction: Transaction;
  conversationRef: DocumentReference;
  message: MessageSchemaType;
  direction: DirectionType;
  toUpdateProfileData?: Omit<LineProfile, "profileUpdatedAt">;
}) {
  const {
    transaction,
    conversationRef,
    message,
    direction,
    toUpdateProfileData,
  } = input;
  const conversation = await transaction.get(conversationRef);
  const previousTime = conversation.get("lastMessageAt") as
    | Timestamp
    | undefined;

  const isIncomingDirection = direction === DIRECTION.INCOMING;
  const shouldUpdate =
    !previousTime || message.sentAt.toMillis() >= previousTime.toMillis();

  if (shouldUpdate) {
    transaction.set(
      conversationRef,
      {
        ...(isIncomingDirection ? { userId: message.userId } : {}),
        ...(toUpdateProfileData
          ? {
              profile: {
                ...toUpdateProfileData,
                profileUpdatedAt: FieldValue.serverTimestamp(),
              },
            }
          : {}),
        lastMessage: message.text,
        lastMessageAt: message.sentAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}

export async function saveIncomingMessage(message: IncomingMessageSchemaType) {
  const db = getAdminDb();
  const conversationRef = getConversationRef(message.userId);
  const conversationSnapshot = await conversationRef.get();

  // check profile
  let toUpdateProfileData: Omit<LineProfile, "profileUpdatedAt"> | undefined;
  const profile: LineProfile | undefined = conversationSnapshot.get("profile");
  const isOutDatedProfile = profile
    ? differenceInHours(new Date(), profile.profileUpdatedAt.toDate()) >= 24
    : false;
  const shouldUpdateProfile = !profile || isOutDatedProfile;

  if (shouldUpdateProfile) {
    toUpdateProfileData = await getProfile(message.userId);
  }
  const messageRef = conversationRef
    .collection("messages")
    .doc(message.eventId);

  await db.runTransaction(async (transaction) => {
    const existingMessage = await transaction.get(messageRef);
    if (existingMessage.exists) return;

    await updateLastMessage({
      transaction,
      conversationRef,
      message,
      direction: DIRECTION.INCOMING,
      toUpdateProfileData,
    });
    transaction.set(messageRef, {
      ...message,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function createOutgoingMessage(input: {
  id: string;
  message: OutgoingMessageSchemaType;
}) {
  const { id, message } = input;
  await getConversationRef(message.userId)
    .collection("messages")
    .doc(id)
    .set({
      ...message,
      createdAt: FieldValue.serverTimestamp(),
    });
}

export async function markOutgoingAccepted(
  id: string,
  message: MessageSchemaType,
  sentMessage: { id: string; quoteToken?: string },
) {
  const db = getAdminDb();
  const conversationRef = getConversationRef(message.userId);
  const messageRef = conversationRef.collection("messages").doc(id);

  await db.runTransaction(async (transaction) => {
    await updateLastMessage({
      transaction,
      conversationRef,
      message,
      direction: DIRECTION.OUTGOING,
    });
    transaction.update(messageRef, {
      status: STATUS.ACCEPTED,
      messageId: sentMessage.id,
      ...(sentMessage.quoteToken ? { quoteToken: sentMessage.quoteToken } : {}),
    });
  });
}

export async function markOutgoingUnknown(userId: string, id: string) {
  await getConversationRef(userId)
    .collection("messages")
    .doc(id)
    .update({ status: STATUS.UNKNOWN });
}
