import type { ChatMessage, TokenUsage } from "../dto/chat.dto.js";

export interface ProviderCompletion {
  provider: "openai" | "anthropic" | "gemini";
  model: string;
  content: string;
  usage: TokenUsage;
}

export interface ChatProviderClient {
  complete(messages: ChatMessage[]): Promise<ProviderCompletion>;
}
