export type TraceStatus = "ok" | "error" | "cancelled" | "running";
export type SpanKind = "llm" | "tool" | "retrieval" | "agent" | "workflow" | "custom";

export interface Session {
  id: string;
  traceId: string;
  name: string;
  userId: string | null;
  serviceName: string;
  status: TraceStatus;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  input: string | null;
  output: string | null;
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TraceUsage {
  id: string;
  sessionId: string;
  spanId: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  createdAt: string;
}

export interface Span {
  id: string;
  sessionId: string;
  traceId: string;
  parentSpanId: string | null;
  name: string;
  kind: SpanKind;
  status: TraceStatus;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  input: string | null;
  output: string | null;
  attributes: Record<string, unknown>;
  usage?: TraceUsage[];
}

export interface TraceEvent {
  id: string;
  sessionId: string;
  spanId: string | null;
  name: string;
  attributes: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export interface TraceError {
  id: string;
  sessionId: string;
  spanId: string | null;
  name: string;
  message: string;
  type: string | null;
  stack: string | null;
  attributes: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export type TimelineItem =
  | { type: "session"; timestamp: string; data: Session }
  | { type: "span"; timestamp: string; data: Span }
  | { type: "event"; timestamp: string; data: TraceEvent }
  | { type: "error"; timestamp: string; data: TraceError };

export interface SessionsResponse {
  data: Session[];
}

export interface SessionTimelineResponse {
  session: Session;
  timeline: TimelineItem[];
}
