import type { EventRepository } from "../repositories/event.repository.js";
import type { ProjectAuthContext } from "../repositories/project.repository.js";
import type { SessionRepository } from "../repositories/session.repository.js";
import type { SpanRepository } from "../repositories/span.repository.js";
import { HttpError } from "../middleware/error.middleware.js";

export class TimelineService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly spans: SpanRepository,
    private readonly events: EventRepository
  ) {}

  async getSessionTimeline(sessionId: string, context: ProjectAuthContext) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new HttpError(404, "Session not found");
    }
    if (session.projectId !== context.project.id) {
      throw new HttpError(404, "Session not found");
    }

    const [spanRows, eventRows, errorRows, usageRows] = await Promise.all([
      this.spans.listBySession(sessionId),
      this.events.listEventsBySession(sessionId),
      this.events.listErrorsBySession(sessionId),
      this.spans.listUsageBySession(sessionId)
    ]);

    const timeline = [
      {
        type: "session",
        timestamp: session.startedAt,
        data: session
      },
      ...spanRows.map((span) => ({
        type: "span",
        timestamp: span.startedAt,
        data: {
          ...span,
          usage: usageRows.filter((usage) => usage.spanId === span.id)
        }
      })),
      ...eventRows.map((event) => ({
        type: "event",
        timestamp: event.occurredAt,
        data: event
      })),
      ...errorRows.map((error) => ({
        type: "error",
        timestamp: error.occurredAt,
        data: error
      }))
    ].sort((left, right) => left.timestamp.localeCompare(right.timestamp));

    return {
      session,
      timeline
    };
  }
}
