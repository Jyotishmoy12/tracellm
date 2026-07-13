import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1)
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  mode: z.enum(["standard", "tool", "retrieval", "agent", "workflow", "custom"]).default("standard")
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  provider: string;
  model: string;
  mode: ChatRequest["mode"];
  message: ChatMessage;
  usage: TokenUsage;
  latencyMs: number;
  diagnostics: Array<{
    name: string;
    kind: "workflow" | "llm" | "tool" | "retrieval" | "agent" | "custom";
    durationMs: number;
    metadata: Record<string, unknown>;
  }>;
}
