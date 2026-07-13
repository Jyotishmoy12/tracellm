import { env } from "../config/env.js";
import type { ChatMessage } from "../dto/chat.dto.js";
import type { ChatProviderClient, ProviderCompletion } from "./types.js";

export class AnthropicProvider implements ChatProviderClient {
  async complete(messages: ChatMessage[]): Promise<ProviderCompletion> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 700,
        messages
      })
    });

    const data = (await response.json().catch(() => undefined)) as Record<string, any> | undefined;
    if (!response.ok) {
      throw new Error(`Anthropic failed (${response.status}): ${JSON.stringify(data)}`);
    }

    const content = data?.content
      ?.map((item: { text?: string }) => item.text)
      .filter(Boolean)
      .join("\n");
    if (!content) {
      throw new Error("Anthropic response did not include text output");
    }

    const inputTokens = data?.usage?.input_tokens ?? 0;
    const outputTokens = data?.usage?.output_tokens ?? 0;

    return {
      provider: "anthropic",
      model: data?.model ?? env.ANTHROPIC_MODEL,
      content: content.trim(),
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    };
  }
}
