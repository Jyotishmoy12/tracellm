import { Router } from "express";
import { loginSchema, registerSchema } from "@tracellm/shared";
import type { AuthController } from "../controllers/auth.controller.js";
import { userAuthMiddleware } from "../middleware/user-auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { validateBody } from "../validators/validate-request.js";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/auth/register", validateBody(registerSchema), asyncHandler(controller.register.bind(controller)));
  router.post("/auth/login", validateBody(loginSchema), asyncHandler(controller.login.bind(controller)));
  router.get("/auth/me", userAuthMiddleware, asyncHandler(controller.me.bind(controller)));
  router.post("/auth/logout", controller.logout.bind(controller));

  return router;
}
