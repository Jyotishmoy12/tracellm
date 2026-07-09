import type { Request, Response } from "express";
import type { ProjectService } from "../services/project.service.js";

export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  getConfig(request: Request, response: Response) {
    response.json(this.projects.getConfig(request.tracellm));
  }

  async updateConfig(request: Request, response: Response) {
    const updated = await this.projects.updateConfig(request.tracellm, request.body);
    response.json(updated);
  }

  async listApiKeys(request: Request, response: Response) {
    response.json(await this.projects.listApiKeys(request.tracellm));
  }

  async createApiKey(request: Request, response: Response) {
    const created = await this.projects.createApiKey(request.tracellm, request.body);
    response.status(201).json(created);
  }

  async revokeApiKey(request: Request, response: Response) {
    const revoked = await this.projects.revokeApiKey(request.tracellm, readParam(request, "keyId"));
    response.json(revoked);
  }

  async listExportDestinations(request: Request, response: Response) {
    response.json(await this.projects.listExportDestinations(request.tracellm));
  }

  async createExportDestination(request: Request, response: Response) {
    const created = await this.projects.createExportDestination(request.tracellm, request.body);
    response.status(201).json(created);
  }

  async updateExportDestination(request: Request, response: Response) {
    const updated = await this.projects.updateExportDestination(
      request.tracellm,
      readParam(request, "destinationId"),
      request.body
    );
    response.json(updated);
  }

  async deleteExportDestination(request: Request, response: Response) {
    const deleted = await this.projects.deleteExportDestination(request.tracellm, readParam(request, "destinationId"));
    response.json(deleted);
  }

  async testExportDestination(request: Request, response: Response) {
    const result = await this.projects.testExportDestination(request.tracellm, readParam(request, "destinationId"));
    response.json(result);
  }
}

function readParam(request: Request, name: string): string {
  const value = request.params[name];
  if (typeof value !== "string") {
    throw new Error(`Missing route parameter: ${name}`);
  }
  return value;
}
