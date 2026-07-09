import type { CreateSessionRequest, EndSessionRequest } from "../dto/session.dto.js";
import type { ProjectAuthContext } from "../repositories/project.repository.js";
import { HttpError } from "../middleware/error.middleware.js";
import type { SessionRepository } from "../repositories/session.repository.js";
import { createId, createTraceId } from "../utils/ids.js";

export class SessionService {
  constructor(private readonly sessions: SessionRepository) {}

  async create(payload: CreateSessionRequest, context: ProjectAuthContext) {
    const now = new Date().toISOString();
    return this.sessions.create({
      id: createId("ses"),
      projectId: context.project.id,
      traceId: payload.traceId ?? createTraceId(),
      name: payload.name ?? "LLM session",
      userId: payload.userId ?? null,
      serviceName: payload.serviceName ?? "tracellm-node-app",
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
  }

  async list(context: ProjectAuthContext) {
    return this.sessions.list(context.project.id);
  }

  async get(sessionId: string, context: ProjectAuthContext) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new HttpError(404, "Session not found");
    }
    if (session.projectId !== context.project.id) {
      throw new HttpError(404, "Session not found");
    }
    return session;
  }

  async end(sessionId: string, payload: EndSessionRequest, context: ProjectAuthContext) {
    const session = await this.get(sessionId, context);
    const endedAt = new Date().toISOString();
    const durationMs = new Date(endedAt).getTime() - new Date(session.startedAt).getTime();
    const updated = await this.sessions.update(sessionId, {
      status: payload.status,
      endedAt,
      durationMs,
      output: shouldCaptureOutput(context) ? redact(payload.output ?? session.output, context) : session.output,
      attributes: context.tracingConfig.captureMetadata ? { ...session.attributes, ...(payload.attributes ?? {}) } : {},
      updatedAt: endedAt
    });

    if (!updated) {
      throw new HttpError(404, "Session not found");
    }

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
