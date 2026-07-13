import { env } from "../config/env.js";
import type { ChatMessage } from "../dto/chat.dto.js";
import type { ChatProviderClient, ProviderCompletion } from "./types.js";

export class GeminiProvider implements ChatProviderClient {
  async complete(messages: ChatMessage[]): Promise<ProviderCompletion> {
    const prompt = messages.map((message) => `${message.role}: ${message.content}`).join("\n\n");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        env.GEMINI_API_KEY ?? ""
      )}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = (await response.json().catch(() => undefined)) as Record<string, any> | undefined;
    if (!response.ok) {
      throw new Error(`Gemini failed (${response.status}): ${JSON.stringify(data)}`);
    }

    const content = data?.candidates
      ?.flatMap((candidate: { content?: { parts?: Array<{ text?: string }> } }) => candidate.content?.parts ?? [])
      .map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n");
    if (!content) {
      throw new Error("Gemini response did not include text output");
    }

    return {
      provider: "gemini",
      model: env.GEMINI_MODEL,
      content: content.trim(),
      usage: {
        inputTokens: data?.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data?.usageMetadata?.totalTokenCount ?? 0
      }
    };
  }
}
