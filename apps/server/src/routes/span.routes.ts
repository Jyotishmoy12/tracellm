import { Router } from "express";
import type { SpanController } from "../controllers/span.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../validators/validate-request.js";
import { createSpanSchema, endSpanSchema } from "../validators/span.schema.js";

export function createSpanRoutes(controller: SpanController): Router {
  const router = Router();

  router.post("/spans", validateBody(createSpanSchema), asyncHandler(controller.create.bind(controller)));
  router.get("/spans/:spanId", asyncHandler(controller.get.bind(controller)));
  router.post("/spans/:spanId/end", validateBody(endSpanSchema), asyncHandler(controller.end.bind(controller)));

  return router;
}
