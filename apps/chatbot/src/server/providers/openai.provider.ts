import { env } from "../config/env.js";
import type { ChatMessage } from "../dto/chat.dto.js";
import type { ChatProviderClient, ProviderCompletion } from "./types.js";

export class OpenAIProvider implements ChatProviderClient {
  async complete(messages: ChatMessage[]): Promise<ProviderCompletion> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        input: messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      })
    });

    const data = (await response.json().catch(() => undefined)) as Record<string, any> | undefined;
    if (!response.ok) {
      throw new Error(`OpenAI failed (${response.status}): ${JSON.stringify(data)}`);
    }

    const content =
      data?.output_text ??
      data?.output
        ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
        .map((item: { text?: string }) => item.text)
        .filter(Boolean)
        .join("\n");

    if (!content) {
      throw new Error("OpenAI response did not include text output");
    }

    return {
      provider: "openai",
      model: data?.model ?? env.OPENAI_MODEL,
      content: content.trim(),
      usage: {
        inputTokens: data?.usage?.input_tokens ?? 0,
        outputTokens: data?.usage?.output_tokens ?? 0,
        totalTokens: data?.usage?.total_tokens ?? 0
      }
    };
  }
}
