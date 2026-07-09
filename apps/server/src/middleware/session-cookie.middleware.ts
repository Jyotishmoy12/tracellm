import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.config.js";
import type { JwtService } from "../services/jwt.service.js";
import { readCookie } from "../utils/cookies.js";

export function sessionCookieMiddleware(jwt: JwtService) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    const token = readCookie(request, env.TRACELLM_AUTH_COOKIE_NAME);
    if (!token) {
      next();
      return;
    }

    try {
      request.auth = await jwt.verifySession(token);
    } catch {
      delete request.auth;
    }

    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}
