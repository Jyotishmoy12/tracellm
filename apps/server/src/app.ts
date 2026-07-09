import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { AuthController } from "./controllers/auth.controller.js";
import { HealthController } from "./controllers/health.controller.js";
import { EventController } from "./controllers/event.controller.js";
import { ProjectController } from "./controllers/project.controller.js";
import { SessionController } from "./controllers/session.controller.js";
import { SpanController } from "./controllers/span.controller.js";
import { db } from "./database/client.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { projectAuthMiddleware } from "./middleware/project-auth.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { sessionCookieMiddleware } from "./middleware/session-cookie.middleware.js";
import { AuthRepository } from "./repositories/auth.repository.js";
import { EventRepository } from "./repositories/event.repository.js";
import { ExportDestinationRepository } from "./repositories/export-destination.repository.js";
import { ProjectRepository } from "./repositories/project.repository.js";
import { SessionRepository } from "./repositories/session.repository.js";
import { SpanRepository } from "./repositories/span.repository.js";
import { createRoutes } from "./routes/index.js";
import { AuthService } from "./services/auth.service.js";
import { IngestService } from "./services/ingest.service.js";
import { JwtService } from "./services/jwt.service.js";
import { ProjectService } from "./services/project.service.js";
import { SessionService } from "./services/session.service.js";
import { SpanService } from "./services/span.service.js";
import { TimelineService } from "./services/timeline.service.js";
import { TelemetryMapper } from "./telemetry/telemetry-mapper.js";
import { ProjectExportDispatcher } from "./telemetry/project-export-dispatcher.js";
import { createOpenApiDocument } from "./config/swagger.config.js";

export function createApp(): Express {
  const app = express();
  const openApiDocument = createOpenApiDocument();

  const telemetry = new TelemetryMapper();
  const jwtService = new JwtService();
  const authRepository = new AuthRepository(db);
  const projectRepository = new ProjectRepository(db);
  const exportDestinationRepository = new ExportDestinationRepository(db);
  const sessionRepository = new SessionRepository(db);
  const spanRepository = new SpanRepository(db);
  const eventRepository = new EventRepository(db);

  const authService = new AuthService(authRepository, projectRepository, jwtService);
  const projectExporter = new ProjectExportDispatcher(exportDestinationRepository);
  const projectService = new ProjectService(projectRepository, exportDestinationRepository, projectExporter);
  const sessionService = new SessionService(sessionRepository);
  const spanService = new SpanService(spanRepository, sessionRepository, telemetry, projectExporter);
  const ingestService = new IngestService(eventRepository, sessionRepository, spanRepository, telemetry, projectExporter);
  const timelineService = new TimelineService(sessionRepository, spanRepository, eventRepository);

  const authController = new AuthController(authService);
  const healthController = new HealthController();
  const projectController = new ProjectController(projectService);
  const sessionController = new SessionController(sessionService, timelineService);
  const spanController = new SpanController(spanService);
  const eventController = new EventController(ingestService);

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);
  app.use(sessionCookieMiddleware(jwtService));
  app.use((request, _response, next) => {
    telemetry.recordIngestRequest(request.path);
    next();
  });

  app.get("/openapi.json", (_request, response) => response.json(openApiDocument));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(
    createRoutes({
      healthController,
      authController,
      projectController,
      sessionController,
      spanController,
      eventController,
      projectAuth: projectAuthMiddleware(projectRepository)
    })
  );

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
