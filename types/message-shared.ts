import { Timestamp } from "firebase/firestore";

export const DIRECTION = {
  INCOMING: "INCOMING",
  OUTGOING: "OUTGOING",
};

export const STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  FAILED: "FAILED",
  UNKNOWN: "UNKNOWN",
};

export type LineProfile = {
  displayName: string;
  pictureUrl: string | null;
  profileUpdatedAt: Timestamp;
};
