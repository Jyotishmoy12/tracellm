import { createHash } from "node:crypto";
import { ROOT_CONTEXT, SpanStatusCode, TraceFlags, trace } from "@opentelemetry/api";
import type { ErrorRow, EventRow, SpanRow, UsageRow } from "../database/schema.js";
import { meter, tracer } from "./otel.js";

const requestCounter = meter.createCounter("tracellm.requests", {
  description: "TraceLLM ingest request count"
});
const errorCounter = meter.createCounter("tracellm.errors", {
  description: "TraceLLM recorded error count"
});
const tokenCounter = meter.createCounter("tracellm.tokens", {
  description: "TraceLLM recorded token count"
});
const spanDurationHistogram = meter.createHistogram("tracellm.span.duration_ms", {
  description: "TraceLLM span duration in milliseconds"
});

export class TelemetryMapper {
  recordIngestRequest(route: string): void {
    requestCounter.add(1, { route });
  }

  exportCompletedSpan(spanRow: SpanRow, usageRow?: UsageRow): void {
    const otelSpan = tracer.startSpan(
      spanRow.name,
      {
        startTime: new Date(spanRow.startedAt),
        attributes: {
          "tracellm.session_id": spanRow.sessionId,
          "tracellm.span_id": spanRow.id,
          "tracellm.span_kind": spanRow.kind,
          "tracellm.trace_id": spanRow.traceId,
          "tracellm.parent_span_id": spanRow.parentSpanId ?? "",
          "llm.input_tokens": usageRow?.inputTokens ?? 0,
          "llm.output_tokens": usageRow?.outputTokens ?? 0,
          "llm.total_tokens": usageRow?.totalTokens ?? 0,
          ...flattenAttributes(spanRow.attributes)
        }
      },
      contextFromTraceLlmIds(spanRow.traceId, spanRow.parentSpanId ?? `session:${spanRow.sessionId}`)
    );

    if (spanRow.status === "error") {
      otelSpan.setStatus({ code: SpanStatusCode.ERROR });
    } else {
      otelSpan.setStatus({ code: SpanStatusCode.OK });
    }

    if (spanRow.durationMs !== null) {
      spanDurationHistogram.record(spanRow.durationMs, {
        kind: spanRow.kind,
        status: spanRow.status
      });
    }

    if (usageRow?.totalTokens !== null && usageRow?.totalTokens !== undefined) {
      tokenCounter.add(usageRow.totalTokens, {
        kind: spanRow.kind
      });
    }

    otelSpan.end(spanRow.endedAt ? new Date(spanRow.endedAt) : undefined);
  }

  exportEvent(eventRow: EventRow, traceId: string): void {
    const span = tracer.startSpan(`event:${eventRow.name}`, {
      startTime: new Date(eventRow.occurredAt),
      attributes: {
        "tracellm.session_id": eventRow.sessionId,
        "tracellm.span_id": eventRow.spanId ?? "",
        "tracellm.event_id": eventRow.id,
        ...flattenAttributes(eventRow.attributes)
      }
    }, contextFromTraceLlmIds(traceId, eventRow.spanId ?? `session:${eventRow.sessionId}`));
    span.end(new Date(eventRow.occurredAt));
  }

  exportError(errorRow: ErrorRow, traceId: string): void {
    errorCounter.add(1, {
      type: errorRow.type ?? "Error"
    });

    const span = tracer.startSpan(`error:${errorRow.name}`, {
      startTime: new Date(errorRow.occurredAt),
      attributes: {
        "tracellm.session_id": errorRow.sessionId,
        "tracellm.span_id": errorRow.spanId ?? "",
        "tracellm.error_id": errorRow.id,
        "exception.type": errorRow.type ?? "Error",
        "exception.message": errorRow.message,
        ...flattenAttributes(errorRow.attributes)
      }
    }, contextFromTraceLlmIds(traceId, errorRow.spanId ?? `session:${errorRow.sessionId}`));
    span.recordException({
      name: errorRow.type ?? "Error",
      message: errorRow.message,
      ...(errorRow.stack ? { stack: errorRow.stack } : {})
    });
    span.setStatus({ code: SpanStatusCode.ERROR, message: errorRow.message });
    span.end(new Date(errorRow.occurredAt));
  }
}

function contextFromTraceLlmIds(traceIdSeed: string, parentSpanIdSeed: string) {
  return trace.setSpanContext(ROOT_CONTEXT, {
    traceId: toOtelTraceId(traceIdSeed),
    spanId: toOtelSpanId(parentSpanIdSeed),
    traceFlags: TraceFlags.SAMPLED
  });
}

function toOtelTraceId(value: string): string {
  return /^[0-9a-f]{32}$/i.test(value) && !/^0{32}$/.test(value) ? value.toLowerCase() : digest(value, 32);
}

function toOtelSpanId(value: string): string {
  return /^[0-9a-f]{16}$/i.test(value) && !/^0{16}$/.test(value) ? value.toLowerCase() : digest(value, 16);
}

function digest(value: string, length: number): string {
  const hashed = createHash("sha256").update(value).digest("hex").slice(0, length);
  return /^0+$/.test(hashed) ? "1".padStart(length, "0") : hashed;
}

function flattenAttributes(attributes: Record<string, unknown>): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(attributes).flatMap(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return [[`tracellm.attr.${key}`, value]];
      }
      return [];
    })
  );
}
