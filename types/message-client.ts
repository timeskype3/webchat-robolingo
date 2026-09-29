import { Timestamp } from "firebase/firestore";

import { LineProfile } from "./message-shared";

export type Conversation = {
  id: string;
  userId: string;
  profile: Partial<LineProfile>;
  lastMessage?: string;
};

export type Message = {
  id: string;
  messageType: "text" | "sticker";
  text: string;
  direction: "INCOMING" | "OUTGOING";
  sentAt: Timestamp;
  status?: "PENDING" | "ACCEPTED" | "FAILED" | "UNKNOWN";
};
