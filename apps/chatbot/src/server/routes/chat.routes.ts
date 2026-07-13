import { Router, type Router as ExpressRouter } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { chatRequestSchema } from "../dto/chat.dto.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateBody } from "../middleware/validate.js";

const controller = new ChatController();

export const chatRouter: ExpressRouter = Router();

chatRouter.get("/config", controller.config.bind(controller));
chatRouter.post("/chat", validateBody(chatRequestSchema), asyncHandler(controller.complete.bind(controller)));
