import type { CreateSpanRequest, EndSpanRequest } from "../dto/span.dto.js";
import { HttpError } from "../middleware/error.middleware.js";
import type { ProjectAuthContext } from "../repositories/project.repository.js";
import type { SessionRepository } from "../repositories/session.repository.js";
import type { SpanRepository } from "../repositories/span.repository.js";
import type { TelemetryMapper } from "../telemetry/telemetry-mapper.js";
import type { ProjectExportDispatcher } from "../telemetry/project-export-dispatcher.js";
import { createId } from "../utils/ids.js";

export class SpanService {
  constructor(
    private readonly spans: SpanRepository,
    private readonly sessions: SessionRepository,
    private readonly telemetry: TelemetryMapper,
    private readonly projectExporter: ProjectExportDispatcher
  ) {}

  async create(payload: CreateSpanRequest, context: ProjectAuthContext) {
    if (!context.tracingConfig.enabled || context.tracingConfig.ignoredSpanKinds.includes(payload.kind)) {
      throw new HttpError(202, "Span ignored by project tracing config");
    }

    const session = await this.sessions.findById(payload.sessionId);
    if (!session) {
      throw new HttpError(404, "Session not found");
    }
    if (session.projectId !== context.project.id) {
      throw new HttpError(404, "Session not found");
    }

    const now = new Date().toISOString();
    const span = await this.spans.create({
      id: createId("spn"),
      sessionId: payload.sessionId,
      traceId: payload.traceId ?? session.traceId,
      parentSpanId: payload.parentSpanId ?? null,
      name: payload.name,
      kind: payload.kind,
      status: "running",
      startedAt: now,
      endedAt: null,
      durationMs: null,
      input: shouldCaptureInput(context) ? redact(payload.input ?? null, context) : null,
      output: shouldCaptureOutput(context) ? redact(payload.output ?? null, context) : null,
      attributes: context.tracingConfig.captureMetadata ? payload.attributes ?? {} : {},
      createdAt: now,
      updatedAt: now
    });

    if (payload.usage && context.tracingConfig.captureTokenUsage) {
      await this.spans.createUsage({
        id: createId("usg"),
        sessionId: payload.sessionId,
        spanId: span.id,
        inputTokens: payload.usage.inputTokens ?? null,
        outputTokens: payload.usage.outputTokens ?? null,
        totalTokens: payload.usage.totalTokens ?? null,
        estimatedCostUsd: payload.usage.estimatedCostUsd ?? null,
        createdAt: now
      });
    }

    return span;
  }

  async get(spanId: string, context: ProjectAuthContext) {
    const span = await this.spans.findById(spanId);
    if (!span) {
      throw new HttpError(404, "Span not found");
    }
    const session = await this.sessions.findById(span.sessionId);
    if (!session || session.projectId !== context.project.id) {
      throw new HttpError(404, "Span not found");
    }
    return span;
  }

  async end(spanId: string, payload: EndSpanRequest, context: ProjectAuthContext) {
    const span = await this.get(spanId, context);
    const endedAt = new Date().toISOString();
    const durationMs = new Date(endedAt).getTime() - new Date(span.startedAt).getTime();
    const updated = await this.spans.update(spanId, {
      status: payload.status,
      endedAt,
      durationMs,
      output: shouldCaptureOutput(context) ? redact(payload.output ?? span.output, context) : span.output,
      attributes: context.tracingConfig.captureMetadata ? { ...span.attributes, ...(payload.attributes ?? {}) } : {},
      updatedAt: endedAt
    });

    if (!updated) {
      throw new HttpError(404, "Span not found");
    }

    const usage = payload.usage && context.tracingConfig.captureTokenUsage
      ? await this.spans.createUsage({
          id: createId("usg"),
          sessionId: span.sessionId,
          spanId: span.id,
          inputTokens: payload.usage.inputTokens ?? null,
          outputTokens: payload.usage.outputTokens ?? null,
          totalTokens: payload.usage.totalTokens ?? null,
          estimatedCostUsd: payload.usage.estimatedCostUsd ?? null,
          createdAt: endedAt
        })
      : undefined;

    this.telemetry.exportCompletedSpan(updated, usage);
    this.projectExporter.export({
      kind: "span",
      projectId: context.project.id,
      span: updated,
      ...(usage ? { usage } : {})
    });
    return updated;
  }
}

function shouldCaptureInput(context: ProjectAuthContext): boolean {
  return context.tracingConfig.captureContent || context.tracingConfig.captureInputs;
}

function shouldCaptureOutput(context: ProjectAuthContext): boolean {
  return context.tracingConfig.captureContent || context.tracingConfig.captureOutputs;
}

function redact(value: string | null, context: ProjectAuthContext): string | null {
  if (!value || !context.tracingConfig.redaction.enabled) {
    return value;
  }

  let next = value;
  if (context.tracingConfig.redaction.emails) {
    next = next.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
  }
  if (context.tracingConfig.redaction.apiKeys) {
    next = next.replace(/\b(sk|trllm|api|key)_[A-Za-z0-9_-]{8,}\b/g, "[redacted-key]");
  }
  return next;
}
