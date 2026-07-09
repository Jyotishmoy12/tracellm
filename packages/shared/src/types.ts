export type SpanKind = "llm" | "tool" | "retrieval" | "agent" | "workflow" | "custom";
export type TraceStatus = "ok" | "error" | "cancelled" | "running";

export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
}

export type JsonRecord = Record<string, unknown>;
