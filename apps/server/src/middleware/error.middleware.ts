import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function errorMiddleware(error: unknown, request: Request, response: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details,
        requestId: request.requestId
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: "Validation failed",
        details: error.flatten(),
        requestId: request.requestId
      }
    });
    return;
  }

  response.status(500).json({
    error: {
      message: "Internal server error",
      requestId: request.requestId
    }
  });
}
