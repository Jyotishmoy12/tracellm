import {
  createApiKeySchema,
  createExportDestinationSchema,
  tracingConfigSchema,
  updateExportDestinationSchema,
  updateTracingConfigSchema,
  type CreateApiKeyRequest,
  type CreateExportDestinationRequest,
  type UpdateExportDestinationRequest,
  type UpdateTracingConfigRequest
} from "@tracellm/shared";
import { HttpError } from "../middleware/error.middleware.js";
import type { ExportDestinationRepository } from "../repositories/export-destination.repository.js";
import type { ProjectRepository, ProjectAuthContext } from "../repositories/project.repository.js";
import type { ProjectExportDispatcher } from "../telemetry/project-export-dispatcher.js";
import { createId } from "../utils/ids.js";
import { decryptJson, encryptJson } from "../utils/secret-vault.js";

export class ProjectService {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly exportDestinations: ExportDestinationRepository,
    private readonly projectExporter: ProjectExportDispatcher
  ) {}

  getConfig(context: ProjectAuthContext) {
    return {
      projectId: context.project.id,
      workspaceId: "ws_default",
      projectName: context.project.name,
      apiKeyPrefix: context.apiKey.keyPrefix,
      tracingConfig: context.tracingConfig
    };
  }

  async updateConfig(context: ProjectAuthContext, payload: UpdateTracingConfigRequest) {
    const nextConfig = tracingConfigSchema.parse({
      ...context.tracingConfig,
      ...updateTracingConfigSchema.parse(payload),
      redaction: {
        ...context.tracingConfig.redaction,
        ...(payload.redaction ?? {})
      }
    });

    const updated = await this.projects.updateTracingConfig(context.project.id, nextConfig);
    if (!updated) {
      throw new HttpError(404, "Project not found");
    }

    return this.getConfig(updated);
  }

  async listApiKeys(context: ProjectAuthContext) {
    const keys = await this.projects.listApiKeys(context.project.id);
    return {
      data: keys.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.keyPrefix,
        lastUsedAt: key.lastUsedAt,
        createdAt: key.createdAt,
        isCurrent: key.id === context.apiKey.id
      }))
    };
  }

  async createApiKey(context: ProjectAuthContext, payload: CreateApiKeyRequest) {
    const parsed = createApiKeySchema.parse(payload);
    const created = await this.projects.createApiKey(context.project.id, parsed.name);

    return {
      id: created.row.id,
      name: created.row.name,
      prefix: created.row.keyPrefix,
      apiKey: created.secret,
      createdAt: created.row.createdAt,
      lastUsedAt: created.row.lastUsedAt,
      isCurrent: false
    };
  }

  async revokeApiKey(context: ProjectAuthContext, keyId: string) {
    const revoked = await this.projects.revokeApiKey(context.project.id, keyId, context.apiKey.id);
    if (!revoked) {
      throw new HttpError(400, "API key could not be revoked");
    }

    return { revoked: true };
  }

  async listExportDestinations(context: ProjectAuthContext) {
    const destinations = await this.exportDestinations.list(context.project.id);
    return { data: destinations.map(toExportDestinationResponse) };
  }

  async createExportDestination(context: ProjectAuthContext, payload: CreateExportDestinationRequest) {
    const parsed = createExportDestinationSchema.parse(payload);
    const now = new Date().toISOString();
    const created = await this.exportDestinations.create({
      id: createId("exp"),
      projectId: context.project.id,
      name: parsed.name,
      type: "otlp_http",
      enabled: parsed.enabled,
      endpoint: parsed.endpoint,
      encryptedHeaders: encryptJson(parsed.headers ?? {}),
      lastTestedAt: null,
      lastStatus: null,
      lastError: null,
      createdAt: now,
      updatedAt: now
    });

    return toExportDestinationResponse(created);
  }

  async updateExportDestination(
    context: ProjectAuthContext,
    destinationId: string,
    payload: UpdateExportDestinationRequest
  ) {
    const existing = await this.exportDestinations.find(context.project.id, destinationId);
    if (!existing) {
      throw new HttpError(404, "Export destination not found");
    }

    const parsed = updateExportDestinationSchema.parse(payload);
    const updated = await this.exportDestinations.update(context.project.id, destinationId, {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.enabled !== undefined ? { enabled: parsed.enabled } : {}),
      ...(parsed.endpoint !== undefined ? { endpoint: parsed.endpoint } : {}),
      ...(parsed.headers !== undefined ? { encryptedHeaders: encryptJson(parsed.headers) } : {}),
      updatedAt: new Date().toISOString()
    });
    if (!updated) {
      throw new HttpError(404, "Export destination not found");
    }

    return toExportDestinationResponse(updated);
  }

  async deleteExportDestination(context: ProjectAuthContext, destinationId: string) {
    const deleted = await this.exportDestinations.delete(context.project.id, destinationId);
    if (!deleted) {
      throw new HttpError(404, "Export destination not found");
    }

    return { deleted: true };
  }

  async testExportDestination(context: ProjectAuthContext, destinationId: string) {
    const result = await this.projectExporter.test(context.project.id, destinationId);
    if (!result.ok) {
      return { ok: false, error: result.error ?? "Export test failed" };
    }
    return { ok: true };
  }
}

function toExportDestinationResponse(destination: {
  id: string;
  name: string;
  type: "otlp_http";
  enabled: boolean;
  endpoint: string;
  encryptedHeaders: string;
  lastTestedAt: string | null;
  lastStatus: "ok" | "failed" | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}) {
  const headers = decryptJson<Record<string, string>>(destination.encryptedHeaders, {});
  return {
    id: destination.id,
    name: destination.name,
    type: destination.type,
    enabled: destination.enabled,
    endpoint: destination.endpoint,
    headers: Object.fromEntries(Object.keys(headers).map((key) => [key, "********"])),
    lastTestedAt: destination.lastTestedAt,
    lastStatus: destination.lastStatus,
    lastError: destination.lastError,
    createdAt: destination.createdAt,
    updatedAt: destination.updatedAt
  };
}
