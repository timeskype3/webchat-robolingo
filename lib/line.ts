import "server-only";
import { messagingApi, validateSignature } from "@line/bot-sdk";

let client: messagingApi.MessagingApiClient | undefined;

export function getLineClient() {
  if (!client) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
      throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
    }
    client = new messagingApi.MessagingApiClient({
      channelAccessToken,
    });
  }
  return client;
}

export function verifyLineSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) {
    throw new Error("Missing LINE_CHANNEL_SECRET");
  }

  if (!signature) return false;

  return validateSignature(rawBody, channelSecret, signature);
}

export async function getProfile(userId: string) {
  try {
    const profile = await getLineClient().getProfile(userId);
    return {
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl ?? null,
    };
  } catch {
    console.error("Fail to get Line profile");
  }
}
