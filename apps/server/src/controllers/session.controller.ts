import type { Request, Response } from "express";
import type { SessionService } from "../services/session.service.js";
import type { TimelineService } from "../services/timeline.service.js";
import { HttpError } from "../middleware/error.middleware.js";

export class SessionController {
  constructor(
    private readonly sessions: SessionService,
    private readonly timeline: TimelineService
  ) {}

  async create(request: Request, response: Response) {
    const session = await this.sessions.create(request.body, request.tracellm);
    response.status(201).json(session);
  }

  async list(request: Request, response: Response) {
    const sessions = await this.sessions.list(request.tracellm);
    response.json({ data: sessions });
  }

  async get(request: Request, response: Response) {
    const session = await this.sessions.get(readParam(request, "sessionId"), request.tracellm);
    response.json(session);
  }

  async timelineForSession(request: Request, response: Response) {
    const timeline = await this.timeline.getSessionTimeline(readParam(request, "sessionId"), request.tracellm);
    response.json(timeline);
  }

  async end(request: Request, response: Response) {
    const session = await this.sessions.end(readParam(request, "sessionId"), request.body, request.tracellm);
    response.json(session);
  }
}

function readParam(request: Request, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string") {
    throw new HttpError(400, `Missing route parameter: ${name}`);
  }
  return value;
}
