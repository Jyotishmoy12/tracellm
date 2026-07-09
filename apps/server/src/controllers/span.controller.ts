import type { Request, Response } from "express";
import type { SpanService } from "../services/span.service.js";
import { HttpError } from "../middleware/error.middleware.js";

export class SpanController {
  constructor(private readonly spans: SpanService) {}

  async create(request: Request, response: Response) {
    const span = await this.spans.create(request.body, request.tracellm);
    response.status(201).json(span);
  }

  async get(request: Request, response: Response) {
    const span = await this.spans.get(readParam(request, "spanId"), request.tracellm);
    response.json(span);
  }

  async end(request: Request, response: Response) {
    const span = await this.spans.end(readParam(request, "spanId"), request.body, request.tracellm);
    response.json(span);
  }
}

function readParam(request: Request, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string") {
    throw new HttpError(400, `Missing route parameter: ${name}`);
  }
  return value;
}
