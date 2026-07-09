import type { Request, Response } from "express";
import { appConfig } from "../config/app.config.js";
import { signozExporterConfig } from "../telemetry/signoz-exporter.js";

export class HealthController {
  getHealth(_request: Request, response: Response) {
    response.json({
      status: "ok",
      service: appConfig.name,
      version: appConfig.version,
      environment: appConfig.environment,
      captureContent: appConfig.captureContent,
      telemetry: signozExporterConfig
    });
  }

  getLive(_request: Request, response: Response) {
    response.json({
      status: "live",
      service: appConfig.name
    });
  }

  getReady(_request: Request, response: Response) {
    response.json({
      status: "ready",
      service: appConfig.name,
      telemetry: signozExporterConfig
    });
  }
}
