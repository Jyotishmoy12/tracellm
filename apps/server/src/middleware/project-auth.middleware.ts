import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.config.js";
import { HttpError } from "./error.middleware.js";
import type { ProjectRepository, ProjectAuthContext } from "../repositories/project.repository.js";

export function projectAuthMiddleware(projects: ProjectRepository) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const explicitKey = readApiKey(request);
      const rawKey = explicitKey ?? (!request.auth && !env.TRACELLM_AUTH_REQUIRED ? env.TRACELLM_DEV_API_KEY : undefined);
      if (rawKey) {
        const context = await projects.findApiKey(rawKey);
        if (!context) {
          throw new HttpError(401, "Invalid TraceLLM API key");
        }

        request.tracellm = context;
        next();
        return;
      }

      if (request.auth) {
        const context = await projects.getProjectForUser(request.auth.userId);
        if (!context) {
          throw new HttpError(403, "No project access");
        }

        request.tracellm = context;
        next();
        return;
      }

      if (!rawKey) {
        throw new HttpError(401, "Authentication required");
      }
    } catch (error) {
      next(error);
    }
  };
}

function readApiKey(request: Request): string | undefined {
  const explicit = request.header("x-tracellm-api-key");
  if (explicit) {
    return explicit;
  }

  const authorization = request.header("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return undefined;
}

declare global {
  namespace Express {
    interface Request {
      tracellm: ProjectAuthContext;
    }
  }
}
