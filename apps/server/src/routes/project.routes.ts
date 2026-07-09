import { Router } from "express";
import {
  createApiKeySchema,
  createExportDestinationSchema,
  updateExportDestinationSchema,
  updateTracingConfigSchema
} from "@tracellm/shared";
import type { ProjectController } from "../controllers/project.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../validators/validate-request.js";

export function createProjectRoutes(controller: ProjectController): Router {
  const router = Router();

  router.get("/config", controller.getConfig.bind(controller));
  router.get("/projects/current/config", controller.getConfig.bind(controller));
  router.put(
    "/projects/current/config",
    validateBody(updateTracingConfigSchema),
    asyncHandler(controller.updateConfig.bind(controller))
  );
  router.get("/projects/current/api-keys", asyncHandler(controller.listApiKeys.bind(controller)));
  router.post(
    "/projects/current/api-keys",
    validateBody(createApiKeySchema),
    asyncHandler(controller.createApiKey.bind(controller))
  );
  router.delete("/projects/current/api-keys/:keyId", asyncHandler(controller.revokeApiKey.bind(controller)));
  router.get(
    "/projects/current/export-destinations",
    asyncHandler(controller.listExportDestinations.bind(controller))
  );
  router.post(
    "/projects/current/export-destinations",
    validateBody(createExportDestinationSchema),
    asyncHandler(controller.createExportDestination.bind(controller))
  );
  router.put(
    "/projects/current/export-destinations/:destinationId",
    validateBody(updateExportDestinationSchema),
    asyncHandler(controller.updateExportDestination.bind(controller))
  );
  router.delete(
    "/projects/current/export-destinations/:destinationId",
    asyncHandler(controller.deleteExportDestination.bind(controller))
  );
  router.post(
    "/projects/current/export-destinations/:destinationId/test",
    asyncHandler(controller.testExportDestination.bind(controller))
  );

  return router;
}
