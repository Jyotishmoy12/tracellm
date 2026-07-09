import type { Request, Response } from "express";
import { env } from "../config/env.config.js";

export function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.header("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return undefined;
}

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(env.TRACELLM_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.TRACELLM_AUTH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: env.TRACELLM_JWT_TTL_SECONDS * 1_000
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(env.TRACELLM_AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.TRACELLM_AUTH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/"
  });
}
