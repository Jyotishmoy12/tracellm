export type ChatMode = "standard" | "tool" | "retrieval" | "agent" | "workflow" | "custom";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatConfig {
  provider: string;
  model: string;
  hasProviderKey: boolean;
  simulateProviderError: boolean;
  traceLLM: {
    enabled: boolean;
    endpoint: string;
    hasApiKey: boolean;
    captureContent: boolean;
    note: string;
  };
}

export interface ChatResponse {
  provider: string;
  model: string;
  mode: ChatMode;
  message: ChatMessage;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  diagnostics: Array<{
    name: string;
    kind: "workflow" | "llm" | "tool" | "retrieval" | "agent" | "custom";
    durationMs: number;
    metadata: Record<string, unknown>;
  }>;
}
