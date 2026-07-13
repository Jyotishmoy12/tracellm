import { env } from "../config/env.js";
import { AnthropicProvider } from "./anthropic.provider.js";
import { GeminiProvider } from "./gemini.provider.js";
import { OpenAIProvider } from "./openai.provider.js";
import type { ChatProviderClient } from "./types.js";

export function createProvider(): ChatProviderClient {
  if (env.CHATBOT_PROVIDER === "openai") {
    return new OpenAIProvider();
  }
  if (env.CHATBOT_PROVIDER === "anthropic") {
    return new AnthropicProvider();
  }
  return new GeminiProvider();
}
