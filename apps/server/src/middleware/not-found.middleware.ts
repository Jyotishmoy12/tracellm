import type { Request, Response } from "express";

export function notFoundMiddleware(request: Request, response: Response) {
  response.status(404).json({
    error: {
      message: `Route not found: ${request.method} ${request.path}`,
      requestId: request.requestId
    }
  });
}
