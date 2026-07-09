import { Router, type RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";
import type { EventController } from "../controllers/event.controller.js";
import type { HealthController } from "../controllers/health.controller.js";
import type { ProjectController } from "../controllers/project.controller.js";
import type { SessionController } from "../controllers/session.controller.js";
import type { SpanController } from "../controllers/span.controller.js";
import { createAuthRoutes } from "./auth.routes.js";
import { createEventRoutes } from "./event.routes.js";
import { createHealthRoutes } from "./health.routes.js";
import { createProjectRoutes } from "./project.routes.js";
import { createSessionRoutes } from "./session.routes.js";
import { createSpanRoutes } from "./span.routes.js";

interface RouteDependencies {
  healthController: HealthController;
  authController: AuthController;
  projectController: ProjectController;
  sessionController: SessionController;
  spanController: SpanController;
  eventController: EventController;
  projectAuth: RequestHandler;
}

export function createRoutes(dependencies: RouteDependencies): Router {
  const router = Router();
  const v1 = Router();

  router.use(createHealthRoutes(dependencies.healthController));
  v1.use(createAuthRoutes(dependencies.authController));
  v1.use(dependencies.projectAuth);
  v1.use(createProjectRoutes(dependencies.projectController));
  v1.use(createSessionRoutes(dependencies.sessionController));
  v1.use(createSpanRoutes(dependencies.spanController));
  v1.use(createEventRoutes(dependencies.eventController));
  router.use("/v1", v1);

  return router;
}
