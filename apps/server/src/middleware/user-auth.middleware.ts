import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./error.middleware.js";

export function userAuthMiddleware(request: Request, _response: Response, next: NextFunction) {
  if (!request.auth) {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  next();
}
