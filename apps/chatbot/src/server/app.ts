import cors from "cors";
import express, { type Express } from "express";
import { chatRouter } from "./routes/chat.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "128kb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "tracellm-chatbot" });
  });

  app.use("/api", chatRouter);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected chatbot error";
    const statusCode = message.includes("failed (4") ? 502 : 500;

    response.status(statusCode).json({
      error: message,
      hint: "The chatbot server is still running. Retry the request or switch providers in apps/chatbot/.env."
    });
  });

  return app;
}
