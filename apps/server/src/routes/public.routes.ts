import { Router } from "express";
import type { PublicController } from "../controllers/public.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export function createPublicRoutes(publicController: PublicController): Router {
  const router = Router();

  router.get("/public/product-hunt", asyncHandler(publicController.getProductHuntStats.bind(publicController)));

  return router;
}
