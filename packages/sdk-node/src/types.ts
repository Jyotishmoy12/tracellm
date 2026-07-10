import type {
  CreateEventRequest,
  CreateSessionRequest,
  CreateSpanRequest,
  EndSessionRequest,
  EndSpanRequest,
  Usage
} from "@use-tracellm/shared";
import type { TracingConfig } from "@use-tracellm/shared";

export interface TraceLLMConfig {
  endpoint?: string;
  apiKey?: string;
  serviceName?: string;
  captureContent?: boolean;
  configRefreshMs?: number;
  tracing?: Partial<TracingConfig>;
  headers?: Record<string, string>;
}

export type StartSessionInput = Omit<CreateSessionRequest, "serviceName"> & {
  serviceName?: string;
};

export type StartSpanInput = Omit<CreateSpanRequest, "sessionId" | "kind"> & {
  kind?: CreateSpanRequest["kind"];
};

export interface RecordErrorInput {
  spanId?: string;
  name?: string;
  message: string;
  type?: string;
  stack?: string;
  attributes?: Record<string, unknown>;
}

export interface TraceLLMSession {
  id: string;
  traceId: string;
  startSpan(input: StartSpanInput): Promise<TraceLLMSpan>;
  recordEvent(input: Omit<CreateEventRequest, "sessionId">): Promise<unknown>;
  recordError(input: RecordErrorInput): Promise<unknown>;
  end(input?: Partial<EndSessionRequest>): Promise<unknown>;
}

export interface TraceLLMSpan {
  id: string;
  sessionId: string;
  traceId: string;
  recordEvent(input: Omit<CreateEventRequest, "sessionId" | "spanId">): Promise<unknown>;
  recordError(input: Omit<RecordErrorInput, "spanId">): Promise<unknown>;
  end(input?: Partial<EndSpanRequest> & { usage?: Usage }): Promise<unknown>;
}
