import { Router } from "express";
import { createSessionSchema, endSessionSchema } from "../validators/session.schema.js";
import type { SessionController } from "../controllers/session.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../validators/validate-request.js";

export function createSessionRoutes(controller: SessionController): Router {
  const router = Router();

  router.post("/sessions", validateBody(createSessionSchema), asyncHandler(controller.create.bind(controller)));
  router.get("/sessions", asyncHandler(controller.list.bind(controller)));
  router.get("/sessions/:sessionId", asyncHandler(controller.get.bind(controller)));
  router.get("/sessions/:sessionId/timeline", asyncHandler(controller.timelineForSession.bind(controller)));
  router.post("/sessions/:sessionId/end", validateBody(endSessionSchema), asyncHandler(controller.end.bind(controller)));

  return router;
}
