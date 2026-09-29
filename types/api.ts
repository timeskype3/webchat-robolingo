import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";

import { DIRECTION } from "./message-shared";

export type DirectionType = (typeof DIRECTION)[keyof typeof DIRECTION];

export const STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  FAILED: "FAILED",
  UNKNOWN: "UNKNOWN",
} as const;

export const BaseMessageSchema = z.object({
  userId: z.string(),
  text: z.string().trim().min(1).max(5000),
  sentAt: z.instanceof(Timestamp),
  quoteToken: z.string().optional(),
  quotedMessageId: z.string().optional(),
});

const IncomingMessageSchema = BaseMessageSchema.extend({
  direction: z.literal(DIRECTION.INCOMING),
  eventId: z.string(),
  messageId: z.string(),
  messageType: z.enum(["text", "sticker"]),
});

const OutgoingMessageSchema = BaseMessageSchema.extend({
  direction: z.literal(DIRECTION.OUTGOING),
  sentBy: z.string().min(1),
  messageId: z.string().optional(),
  status: z.enum([
    STATUS.PENDING,
    STATUS.ACCEPTED,
    STATUS.FAILED,
    STATUS.UNKNOWN,
  ]),
});

export const MessageSchema = z.discriminatedUnion("direction", [
  IncomingMessageSchema,
  OutgoingMessageSchema,
]);

const BaseWebhookMessageSchema = z.object({
  id: z.string(),
  quoteToken: z.string().optional(),
  quotedMessageId: z.string().optional(),
});

const LineMessageSchema = z.discriminatedUnion("type", [
  BaseWebhookMessageSchema.extend({
    type: z.literal("text"),
    text: z.string(),
  }),

  BaseWebhookMessageSchema.extend({
    type: z.literal("sticker"),
    packageId: z.string(),
    stickerId: z.string(),
    stickerResourceType: z.string(),
  }),
]);

export const WebhookEventSchema = z.object({
  type: z.literal("message"),
  webhookEventId: z.string(),
  timestamp: z.number(),
  source: z.object({
    type: z.literal("user"),
    userId: z.string(),
  }),
  message: LineMessageSchema,
});

export const WebhookMessageSchema = z.object({
  destination: z.string(),
  events: WebhookEventSchema.array(),
});

export type IncomingMessageSchemaType = z.infer<typeof IncomingMessageSchema>;
export type OutgoingMessageSchemaType = z.infer<typeof OutgoingMessageSchema>;
export type MessageSchemaType = z.infer<typeof MessageSchema>;
