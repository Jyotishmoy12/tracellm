import { Router } from "express";
import type { EventController } from "../controllers/event.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../validators/validate-request.js";
import { createErrorSchema, createEventSchema } from "../validators/event.schema.js";

export function createEventRoutes(controller: EventController): Router {
  const router = Router();

  router.post("/events", validateBody(createEventSchema), asyncHandler(controller.recordEvent.bind(controller)));
  router.post("/errors", validateBody(createErrorSchema), asyncHandler(controller.recordError.bind(controller)));

  return router;
}
