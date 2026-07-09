import { Router } from "express";
import type { HealthController } from "../controllers/health.controller.js";

export function createHealthRoutes(controller: HealthController): Router {
  const router = Router();
  router.get("/health", controller.getHealth.bind(controller));
  router.get("/health/live", controller.getLive.bind(controller));
  router.get("/health/ready", controller.getReady.bind(controller));
  return router;
}
