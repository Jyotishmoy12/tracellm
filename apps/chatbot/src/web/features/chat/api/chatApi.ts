import type { ChatConfig, ChatMessage, ChatMode, ChatResponse } from "../types.js";

export async function getConfig(): Promise<ChatConfig> {
  const response = await fetch("/api/config");
  return readJson(response);
}

export async function sendChat(messages: ChatMessage[], mode: ChatMode): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ messages, mode })
  });
  return readJson(response);
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => undefined)) as { error?: string } | undefined;
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with ${response.status}`);
  }
  return data as T;
}
