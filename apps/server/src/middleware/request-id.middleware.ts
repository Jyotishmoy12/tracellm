import type { NextFunction, Request, Response } from "express";
import { createId } from "../utils/ids.js";

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction) {
  const requestId = request.header("x-request-id") ?? createId("req");
  response.setHeader("x-request-id", requestId);
  request.requestId = requestId;
  next();
}

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
