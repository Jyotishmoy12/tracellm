import type { CreateErrorRequest, CreateEventRequest } from "@tracellm/shared";
import { HttpError } from "../middleware/error.middleware.js";
import type { ProjectAuthContext } from "../repositories/project.repository.js";
import type { EventRepository } from "../repositories/event.repository.js";
import type { SessionRepository } from "../repositories/session.repository.js";
import type { SpanRepository } from "../repositories/span.repository.js";
import type { SessionRow } from "../database/schema.js";
import type { TelemetryMapper } from "../telemetry/telemetry-mapper.js";
import type { ProjectExportDispatcher } from "../telemetry/project-export-dispatcher.js";
import { createId } from "../utils/ids.js";

export class IngestService {
  constructor(
    private readonly events: EventRepository,
    private readonly sessions: SessionRepository,
    private readonly spans: SpanRepository,
    private readonly telemetry: TelemetryMapper,
    private readonly projectExporter: ProjectExportDispatcher
  ) {}

  async recordEvent(payload: CreateEventRequest, context: ProjectAuthContext) {
    if (!context.tracingConfig.enabled) {
      throw new HttpError(202, "Event ignored by project tracing config");
    }
    const session = await this.assertSessionAndSpan(payload.sessionId, payload.spanId, context);
    const now = new Date().toISOString();
    const event = await this.events.createEvent({
      id: createId("evt"),
      sessionId: payload.sessionId,
      spanId: payload.spanId ?? null,
      name: payload.name,
      attributes: context.tracingConfig.captureMetadata ? payload.attributes ?? {} : {},
      occurredAt: now,
      createdAt: now
    });
    this.telemetry.exportEvent(event, session.traceId);
    this.projectExporter.export({ kind: "event", projectId: context.project.id, event, traceId: session.traceId });
    return event;
  }

  async recordError(payload: CreateErrorRequest, context: ProjectAuthContext) {
    if (!context.tracingConfig.enabled || !context.tracingConfig.captureErrors) {
      throw new HttpError(202, "Error ignored by project tracing config");
    }
    const session = await this.assertSessionAndSpan(payload.sessionId, payload.spanId, context);
    const now = new Date().toISOString();
    const error = await this.events.createError({
      id: createId("err"),
      sessionId: payload.sessionId,
      spanId: payload.spanId ?? null,
      name: payload.name,
      message: payload.message,
      type: payload.type ?? null,
      stack: context.tracingConfig.captureContent ? payload.stack ?? null : null,
      attributes: context.tracingConfig.captureMetadata ? payload.attributes ?? {} : {},
      occurredAt: now,
      createdAt: now
    });
    this.telemetry.exportError(error, session.traceId);
    this.projectExporter.export({ kind: "error", projectId: context.project.id, error, traceId: session.traceId });
    return error;
  }

  private async assertSessionAndSpan(
    sessionId: string,
    spanId: string | undefined,
    context: ProjectAuthContext
  ): Promise<SessionRow> {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new HttpError(404, "Session not found");
    }
    if (session.projectId !== context.project.id) {
      throw new HttpError(404, "Session not found");
    }
    if (spanId) {
      const span = await this.spans.findById(spanId);
      if (!span) {
        throw new HttpError(404, "Span not found");
      }
      if (span.sessionId !== sessionId) {
        throw new HttpError(400, "Span does not belong to session");
      }
    }

    return session;
  }
}
