import type { Request, Response } from "express";
import type { IngestService } from "../services/ingest.service.js";

export class EventController {
  constructor(private readonly ingest: IngestService) {}

  async recordEvent(request: Request, response: Response) {
    const event = await this.ingest.recordEvent(request.body, request.tracellm);
    response.status(201).json(event);
  }

  async recordError(request: Request, response: Response) {
    const error = await this.ingest.recordError(request.body, request.tracellm);
    response.status(201).json(error);
  }
}
