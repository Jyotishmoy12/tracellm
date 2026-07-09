import type {
  CreateErrorRequest,
  CreateEventRequest,
  CreateSessionRequest,
  CreateSpanRequest,
  EndSessionRequest,
  EndSpanRequest,
  TracingConfig
} from "@tracellm/shared";
import type {
  RecordErrorInput,
  StartSessionInput,
  StartSpanInput,
  TraceLLMConfig,
  TraceLLMSession,
  TraceLLMSpan
} from "./types.js";

export class TraceLLM {
  private readonly endpoint: string;
  private readonly apiKey: string | undefined;
  private readonly serviceName: string;
  private readonly configRefreshMs: number;
  private readonly localTracing: Partial<TracingConfig>;
  private readonly headers: Record<string, string>;
  private config: TracingConfig | undefined;
  private configPromise: Promise<TracingConfig> | undefined;
  private configFetchedAt = 0;

  constructor(config: TraceLLMConfig = {}) {
    this.endpoint = trimTrailingSlash(config.endpoint ?? process.env.TRACELLM_ENDPOINT ?? "https://api.tracellm.in");
    this.apiKey = config.apiKey ?? process.env.TRACELLM_API_KEY;
    this.serviceName = config.serviceName ?? process.env.TRACELLM_SERVICE_NAME ?? "tracellm-node-app";
    this.configRefreshMs = config.configRefreshMs ?? readNumber(process.env.TRACELLM_CONFIG_REFRESH_MS, 30_000);
    this.localTracing = {
      ...(config.tracing ?? {}),
      ...(config.captureContent !== undefined ? { captureContent: config.captureContent } : {})
    };
    this.headers = config.headers ?? {};
  }

  async startSession(input: StartSessionInput = {}): Promise<TraceLLMSession> {
    const tracing = await this.getTracingConfig();
    if (!tracing.enabled || !shouldSample(tracing.samplingRate)) {
      return new NoopSession();
    }

    const payload: CreateSessionRequest = {
      ...stripContent(input, tracing),
      serviceName: input.serviceName ?? this.serviceName
    };
    const session = await this.post<{ id: string; traceId: string }>("/v1/sessions", payload);
    return new SdkSession(this, session.id, session.traceId);
  }

  async startSpan(sessionId: string, input: StartSpanInput): Promise<TraceLLMSpan> {
    const tracing = await this.getTracingConfig();
    if (!tracing.enabled || tracing.ignoredSpanKinds.includes(input.kind ?? "custom")) {
      return new NoopSpan(sessionId);
    }

    const payload: CreateSpanRequest = {
      ...stripContent(input, tracing),
      sessionId,
      kind: input.kind ?? "custom"
    };
    const span = await this.post<{ id: string; sessionId: string; traceId: string }>("/v1/spans", payload);
    return new SdkSpan(this, span.id, span.sessionId, span.traceId);
  }

  async endSession(sessionId: string, input: Partial<EndSessionRequest> = {}): Promise<unknown> {
    return this.post(`/v1/sessions/${sessionId}/end`, stripContent({ status: "ok", ...input }, await this.getTracingConfig()));
  }

  async endSpan(spanId: string, input: Partial<EndSpanRequest> = {}): Promise<unknown> {
    return this.post(`/v1/spans/${spanId}/end`, stripContent({ status: "ok", ...input }, await this.getTracingConfig()));
  }

  async recordEvent(input: CreateEventRequest): Promise<unknown> {
    const tracing = await this.getTracingConfig();
    if (!tracing.enabled) {
      return { ignored: true };
    }
    return this.post("/v1/events", input);
  }

  async recordError(input: CreateErrorRequest): Promise<unknown> {
    const tracing = await this.getTracingConfig();
    if (!tracing.enabled || !tracing.captureErrors) {
      return { ignored: true };
    }
    return this.post("/v1/errors", input);
  }

  async getTracingConfig(): Promise<TracingConfig> {
    const now = Date.now();
    if (this.config && now - this.configFetchedAt < this.configRefreshMs) {
      return this.config;
    }

    this.configPromise ??= this.fetchTracingConfig().then((config) => {
      this.config = config;
      this.configFetchedAt = Date.now();
      return config;
    }).finally(() => {
      this.configPromise = undefined;
    });
    return this.configPromise;
  }

  async refreshTracingConfig(): Promise<TracingConfig> {
    this.config = undefined;
    this.configFetchedAt = 0;
    return this.getTracingConfig();
  }

  private async fetchTracingConfig(): Promise<TracingConfig> {
    try {
      const config = await this.get<{
        tracingConfig: TracingConfig;
      }>("/v1/config");

      return mergeTracingConfig(config.tracingConfig, this.localTracing);
    } catch (error) {
      if (this.endpoint.includes("localhost") || this.endpoint.includes("127.0.0.1")) {
        return mergeTracingConfig(defaultTracingConfig(), this.localTracing);
      }
      throw error;
    }
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.endpoint}${path}`, {
      headers: this.requestHeaders()
    });

    const data = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new Error(`TraceLLM request failed (${response.status}): ${JSON.stringify(data)}`);
    }

    return data as T;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.endpoint}${path}`, {
      method: "POST",
      headers: {
        ...this.requestHeaders(),
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new Error(`TraceLLM request failed (${response.status}): ${JSON.stringify(data)}`);
    }

    return data as T;
  }

  private requestHeaders(): Record<string, string> {
    return {
      ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      ...this.headers
    };
  }
}

class NoopSession implements TraceLLMSession {
  id = "noop_session";
  traceId = "noop_trace";

  async startSpan(): Promise<TraceLLMSpan> {
    return new NoopSpan(this.id);
  }

  async recordEvent(): Promise<unknown> {
    return { ignored: true };
  }

  async recordError(): Promise<unknown> {
    return { ignored: true };
  }

  async end(): Promise<unknown> {
    return { ignored: true };
  }
}

class NoopSpan implements TraceLLMSpan {
  id = "noop_span";
  traceId = "noop_trace";

  constructor(public readonly sessionId: string) {}

  async recordEvent(): Promise<unknown> {
    return { ignored: true };
  }

  async recordError(): Promise<unknown> {
    return { ignored: true };
  }

  async end(): Promise<unknown> {
    return { ignored: true };
  }
}

class SdkSession implements TraceLLMSession {
  constructor(
    private readonly client: TraceLLM,
    public readonly id: string,
    public readonly traceId: string
  ) {}

  startSpan(input: StartSpanInput): Promise<TraceLLMSpan> {
    return this.client.startSpan(this.id, input);
  }

  recordEvent(input: Omit<CreateEventRequest, "sessionId">): Promise<unknown> {
    return this.client.recordEvent({ ...input, sessionId: this.id });
  }

  recordError(input: RecordErrorInput): Promise<unknown> {
    return this.client.recordError({ ...input, name: input.name ?? "exception", sessionId: this.id });
  }

  end(input: Partial<EndSessionRequest> = {}): Promise<unknown> {
    return this.client.endSession(this.id, input);
  }
}

class SdkSpan implements TraceLLMSpan {
  constructor(
    private readonly client: TraceLLM,
    public readonly id: string,
    public readonly sessionId: string,
    public readonly traceId: string
  ) {}

  recordEvent(input: Omit<CreateEventRequest, "sessionId" | "spanId">): Promise<unknown> {
    return this.client.recordEvent({ ...input, sessionId: this.sessionId, spanId: this.id });
  }

  recordError(input: Omit<RecordErrorInput, "spanId">): Promise<unknown> {
    return this.client.recordError({
      ...input,
      name: input.name ?? "exception",
      sessionId: this.sessionId,
      spanId: this.id
    });
  }

  end(input: Partial<EndSpanRequest> = {}): Promise<unknown> {
    return this.client.endSpan(this.id, input);
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function stripContent<T extends object>(value: T, tracing: TracingConfig): T {
  if (tracing.captureContent || tracing.captureInputs || tracing.captureOutputs) {
    return value;
  }

  const copy: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  delete copy.input;
  delete copy.output;
  return copy as T;
}

function shouldSample(samplingRate: number): boolean {
  return samplingRate >= 1 || Math.random() <= samplingRate;
}

function mergeTracingConfig(base: TracingConfig, override: Partial<TracingConfig>): TracingConfig {
  return {
    ...base,
    ...override,
    redaction: {
      ...base.redaction,
      ...(override.redaction ?? {})
    },
    ignoredSpanKinds: override.ignoredSpanKinds ?? base.ignoredSpanKinds,
    ignoredTools: override.ignoredTools ?? base.ignoredTools
  };
}

function defaultTracingConfig(): TracingConfig {
  return {
    enabled: true,
    captureContent: false,
    captureInputs: false,
    captureOutputs: false,
    captureToolCalls: true,
    captureRetrieval: true,
    captureErrors: true,
    captureTokenUsage: true,
    captureLatency: true,
    captureMetadata: true,
    samplingRate: 1,
    redaction: {
      enabled: true,
      emails: true,
      apiKeys: true
    },
    ignoredSpanKinds: [],
    ignoredTools: []
  };
}
