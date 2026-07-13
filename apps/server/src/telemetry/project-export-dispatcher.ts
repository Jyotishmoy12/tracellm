import { exportDestinationConfigSchema, type ExportDestinationConfig } from "@use-tracellm/shared";
import type { ErrorRow, EventRow, SpanRow, UsageRow } from "../database/schema.js";
import type { ExportDestinationRow } from "../database/schema.js";
import type { ExportDestinationRepository } from "../repositories/export-destination.repository.js";
import { decryptJson } from "../utils/secret-vault.js";

type TracePayload =
  | { kind: "span"; projectId: string; span: SpanRow; usage?: UsageRow }
  | { kind: "event"; projectId: string; event: EventRow; traceId: string }
  | { kind: "error"; projectId: string; error: ErrorRow; traceId: string };

type OtlpAttribute = ReturnType<typeof stringAttr> | ReturnType<typeof intAttr> | ReturnType<typeof doubleAttr> | {
  key: string;
  value: { boolValue: boolean };
};

export class ProjectExportDispatcher {
  constructor(private readonly destinations: ExportDestinationRepository) {}

  export(payload: TracePayload): void {
    void this.exportSafely(payload);
  }

  async test(projectId: string, destinationId: string): Promise<{ ok: boolean; error?: string }> {
    const destination = await this.destinations.find(projectId, destinationId);
    if (!destination) {
      return { ok: false, error: "Export destination not found" };
    }

    return this.sendAndRecord(destination.projectId, destination.id, destination.endpoint, destination.encryptedHeaders, {
      resourceSpans: [
        {
          resource: {
            attributes: [
              stringAttr("service.name", "tracellm-export-test"),
              stringAttr("tracellm.project_id", projectId)
            ]
          },
          scopeSpans: [
            {
              scope: { name: "tracellm-project-exporter" },
              spans: [
                {
                  traceId: randomHex(32),
                  spanId: randomHex(16),
                  name: "tracellm.export.test",
                  kind: 1,
                  startTimeUnixNano: toUnixNanos(new Date()),
                  endTimeUnixNano: toUnixNanos(new Date()),
                  attributes: [stringAttr("tracellm.export_destination_id", destination.id)],
                  status: { code: 1 }
                }
              ]
            }
          ]
        }
      ]
    });
  }

  private async exportSafely(payload: TracePayload): Promise<void> {
    const destinations = await this.destinations.listEnabled(payload.projectId);
    await Promise.all(destinations.map((destination) => {
      const config = readExportConfig(destination.exportConfig);
      if (!shouldExport(payload, config)) {
        return Promise.resolve({ ok: true });
      }

      const body = otlpBody(payload, config);
      return this.sendAndRecord(destination.projectId, destination.id, destination.endpoint, destination.encryptedHeaders, body);
    }));
  }

  private async sendAndRecord(
    projectId: string,
    destinationId: string,
    endpoint: string,
    encryptedHeaders: string,
    body: unknown
  ): Promise<{ ok: boolean; error?: string }> {
    const now = new Date().toISOString();
    try {
      const headers = decryptJson<Record<string, string>>(encryptedHeaders, {});
      const response = await fetch(`${trimTrailingSlash(endpoint)}/v1/traces`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`OTLP endpoint returned ${response.status}`);
      }

      await this.destinations.update(projectId, destinationId, {
        lastTestedAt: now,
        lastStatus: "ok",
        lastError: null,
        updatedAt: now
      });
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown export failure";
      await this.destinations.update(projectId, destinationId, {
        lastTestedAt: now,
        lastStatus: "failed",
        lastError: message,
        updatedAt: now
      });
      return { ok: false, error: message };
    }
  }
}

function otlpBody(payload: TracePayload, config: ExportDestinationConfig = readExportConfig()) {
  const traceId = payload.kind === "span" ? payload.span.traceId : payload.traceId;
  const projectId = payload.projectId;
  const rootSpan = sessionRootSpan(payload, traceId);
  const span =
    payload.kind === "span"
      ? spanToOtlp(payload.span, payload.usage, config)
      : payload.kind === "event"
        ? eventToOtlp(payload.event, traceId, config)
        : errorToOtlp(payload.error, traceId, config);

  return {
    resourceSpans: [
      {
        resource: {
          attributes: [
            stringAttr("service.name", "tracellm-project-export"),
            stringAttr("tracellm.project_id", projectId)
          ]
        },
        scopeSpans: [
          {
            scope: { name: "tracellm-project-exporter" },
            spans: [rootSpan, span]
          }
        ]
      }
    ]
  };
}

function spanToOtlp(span: SpanRow, usage: UsageRow | undefined, config: ExportDestinationConfig) {
  return {
    traceId: toHex(span.traceId, 32),
    spanId: toHex(span.id, 16),
    parentSpanId: toSessionRootSpanId(span.sessionId),
    name: span.name,
    kind: 1,
    startTimeUnixNano: toUnixNanos(new Date(span.startedAt)),
    endTimeUnixNano: toUnixNanos(span.endedAt ? new Date(span.endedAt) : new Date()),
    attributes: [
      stringAttr("tracellm.session_id", span.sessionId),
      stringAttr("tracellm.span_id", span.id),
      stringAttr("tracellm.span_kind", span.kind),
      ...(config.exportTokenUsage
        ? [
            intAttr("llm.input_tokens", usage?.inputTokens ?? 0),
            intAttr("llm.output_tokens", usage?.outputTokens ?? 0),
            intAttr("llm.total_tokens", usage?.totalTokens ?? 0)
          ]
        : []),
      ...(config.exportContent && span.input ? [stringAttr("tracellm.input", span.input)] : []),
      ...(config.exportContent && span.output ? [stringAttr("tracellm.output", span.output)] : []),
      ...(config.exportMetadata ? objectAttrs(span.attributes) : [])
    ],
    status: { code: span.status === "error" ? 2 : 1, message: span.status }
  };
}

function eventToOtlp(event: EventRow, traceId: string, config: ExportDestinationConfig) {
  return {
    traceId: toHex(traceId, 32),
    spanId: toHex(event.id, 16),
    parentSpanId: toSessionRootSpanId(event.sessionId),
    name: `event:${event.name}`,
    kind: 1,
    startTimeUnixNano: toUnixNanos(new Date(event.occurredAt)),
    endTimeUnixNano: toUnixNanos(new Date(event.occurredAt)),
    attributes: [
      stringAttr("tracellm.session_id", event.sessionId),
      stringAttr("tracellm.span_id", event.spanId ?? ""),
      stringAttr("tracellm.event_id", event.id),
      ...(config.exportMetadata ? objectAttrs(event.attributes) : [])
    ],
    status: { code: 1 }
  };
}

function errorToOtlp(error: ErrorRow, traceId: string, config: ExportDestinationConfig) {
  return {
    traceId: toHex(traceId, 32),
    spanId: toHex(error.id, 16),
    parentSpanId: toSessionRootSpanId(error.sessionId),
    name: `error:${error.name}`,
    kind: 1,
    startTimeUnixNano: toUnixNanos(new Date(error.occurredAt)),
    endTimeUnixNano: toUnixNanos(new Date(error.occurredAt)),
    attributes: [
      stringAttr("tracellm.session_id", error.sessionId),
      stringAttr("tracellm.span_id", error.spanId ?? ""),
      stringAttr("tracellm.error_id", error.id),
      stringAttr("exception.type", error.type ?? "Error"),
      stringAttr("exception.message", error.message),
      ...(config.exportMetadata ? objectAttrs(error.attributes) : [])
    ],
    events: [
      {
        timeUnixNano: toUnixNanos(new Date(error.occurredAt)),
        name: "exception",
        attributes: [
          stringAttr("exception.type", error.type ?? "Error"),
          stringAttr("exception.message", error.message),
          ...(error.stack ? [stringAttr("exception.stacktrace", error.stack)] : [])
        ]
      }
    ],
    status: { code: 2, message: error.message }
  };
}

function sessionRootSpan(payload: TracePayload, traceId: string) {
  const sessionId =
    payload.kind === "span"
      ? payload.span.sessionId
      : payload.kind === "event"
        ? payload.event.sessionId
        : payload.error.sessionId;
  const date =
    payload.kind === "span"
      ? new Date(payload.span.startedAt)
      : payload.kind === "event"
        ? new Date(payload.event.occurredAt)
        : new Date(payload.error.occurredAt);

  return {
    traceId: toHex(traceId, 32),
    spanId: toSessionRootSpanId(sessionId),
    name: "tracellm.session",
    kind: 1,
    startTimeUnixNano: toUnixNanos(date),
    endTimeUnixNano: toUnixNanos(date),
    attributes: [stringAttr("tracellm.session_id", sessionId), stringAttr("tracellm.synthetic_root", "true")],
    status: { code: 1 }
  };
}

function toSessionRootSpanId(sessionId: string): string {
  return toHex(`session:${sessionId}`, 16);
}

function shouldExport(payload: TracePayload, config: ExportDestinationConfig): boolean {
  if (payload.kind === "span") {
    return config.exportSpans && config.spanKinds.includes(payload.span.kind);
  }
  if (payload.kind === "event") {
    return config.exportEvents;
  }
  return config.exportErrors;
}

function readExportConfig(value?: ExportDestinationRow["exportConfig"]): ExportDestinationConfig {
  return exportDestinationConfigSchema.parse(value ?? {});
}

function objectAttrs(attributes: Record<string, unknown>): OtlpAttribute[] {
  const otlpAttributes: OtlpAttribute[] = [];
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string") {
      otlpAttributes.push(stringAttr(`tracellm.attr.${key}`, value));
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      otlpAttributes.push(doubleAttr(`tracellm.attr.${key}`, value));
      continue;
    }
    if (typeof value === "boolean") {
      otlpAttributes.push({ key: `tracellm.attr.${key}`, value: { boolValue: value } });
    }
  }
  return otlpAttributes;
}

function stringAttr(key: string, value: string) {
  return { key, value: { stringValue: value } };
}

function intAttr(key: string, value: number) {
  return { key, value: { intValue: String(value) } };
}

function doubleAttr(key: string, value: number) {
  return { key, value: { doubleValue: value } };
}

function toUnixNanos(date: Date): string {
  return String(BigInt(date.getTime()) * 1_000_000n);
}

function toHex(value: string, length: number): string {
  const clean = value.replace(/[^a-f0-9]/gi, "").toLowerCase();
  if (clean.length >= length && !/^0+$/.test(clean.slice(0, length))) {
    return clean.slice(0, length);
  }
  let hash = 0;
  for (const char of value) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(length, "0").slice(0, length);
}

function randomHex(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
