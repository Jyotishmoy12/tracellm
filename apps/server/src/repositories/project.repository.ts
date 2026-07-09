import { createHash, randomBytes } from "node:crypto";
import { and, eq, ne } from "drizzle-orm/sql/expressions";
import type { TracingConfig } from "@tracellm/shared";
import type { TraceLlmDb } from "../database/client.js";
import {
  apiKeys,
  projects,
  workspaceMembers,
  type ApiKeyRow,
  type ProjectRow
} from "../database/schema.js";

export interface ProjectAuthContext {
  project: ProjectRow;
  apiKey: ApiKeyRow;
  tracingConfig: TracingConfig;
}

export class ProjectRepository {
  constructor(private readonly database: TraceLlmDb) {}

  async findDefaultProject(): Promise<ProjectRow | undefined> {
    return this.database.select().from(projects).where(eq(projects.id, "proj_default")).get();
  }

  async findApiKey(rawKey: string): Promise<ProjectAuthContext | undefined> {
    const keyHash = hashApiKey(rawKey);
    const apiKey = await this.database.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).get();
    if (!apiKey) {
      return undefined;
    }

    const project = await this.database.select().from(projects).where(eq(projects.id, apiKey.projectId)).get();
    if (!project) {
      return undefined;
    }

    await this.database
      .update(apiKeys)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(apiKeys.id, apiKey.id))
      .run();

    return {
      project,
      apiKey,
      tracingConfig: normalizeTracingConfig(project.tracingConfig)
    };
  }

  async getCurrentProject(projectId: string): Promise<ProjectAuthContext | undefined> {
    const project = await this.database.select().from(projects).where(eq(projects.id, projectId)).get();
    const apiKey = await this.database.select().from(apiKeys).where(eq(apiKeys.projectId, projectId)).get();
    if (!project || !apiKey) {
      return undefined;
    }

    return {
      project,
      apiKey,
      tracingConfig: normalizeTracingConfig(project.tracingConfig)
    };
  }

  async getProjectForUser(userId: string): Promise<ProjectAuthContext | undefined> {
    const membership = await this.database
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .get();
    if (!membership) {
      return undefined;
    }

    const project = await this.database
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, membership.workspaceId))
      .get();
    if (!project) {
      return undefined;
    }

    const apiKey = await this.database.select().from(apiKeys).where(eq(apiKeys.projectId, project.id)).get();
    if (!apiKey) {
      return undefined;
    }

    return {
      project,
      apiKey,
      tracingConfig: normalizeTracingConfig(project.tracingConfig)
    };
  }

  async updateTracingConfig(projectId: string, config: TracingConfig): Promise<ProjectAuthContext | undefined> {
    const updated = await this.database
      .update(projects)
      .set({
        tracingConfig: config,
        updatedAt: new Date().toISOString()
      })
      .where(eq(projects.id, projectId))
      .returning()
      .get();

    if (!updated) {
      return undefined;
    }

    return this.getCurrentProject(projectId);
  }

  async listApiKeys(projectId: string): Promise<ApiKeyRow[]> {
    return this.database.select().from(apiKeys).where(eq(apiKeys.projectId, projectId)).all();
  }

  async createApiKey(projectId: string, name: string): Promise<{ row: ApiKeyRow; secret: string }> {
    const secret = `trllm_${randomBytes(24).toString("hex")}`;
    const now = new Date().toISOString();
    const row = await this.database
      .insert(apiKeys)
      .values({
        id: `key_${randomBytes(12).toString("hex")}`,
        projectId,
        name,
        keyHash: hashApiKey(secret),
        keyPrefix: secret.slice(0, 10),
        lastUsedAt: null,
        createdAt: now
      })
      .returning()
      .get();

    return { row, secret };
  }

  async revokeApiKey(projectId: string, keyId: string, currentKeyId: string): Promise<boolean> {
    if (keyId === currentKeyId) {
      return false;
    }

    const deleted = await this.database
      .delete(apiKeys)
      .where(and(eq(apiKeys.projectId, projectId), eq(apiKeys.id, keyId), ne(apiKeys.id, currentKeyId)))
      .returning()
      .get();

    return Boolean(deleted);
  }
}

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function normalizeTracingConfig(rawValue: unknown): TracingConfig {
  const value = parseTracingConfig(rawValue);

  return {
    enabled: readBoolean(value.enabled, true),
    captureContent: readBoolean(value.captureContent, false),
    captureInputs: readBoolean(value.captureInputs, false),
    captureOutputs: readBoolean(value.captureOutputs, false),
    captureToolCalls: readBoolean(value.captureToolCalls, true),
    captureRetrieval: readBoolean(value.captureRetrieval, true),
    captureErrors: readBoolean(value.captureErrors, true),
    captureTokenUsage: readBoolean(value.captureTokenUsage, true),
    captureLatency: readBoolean(value.captureLatency, true),
    captureMetadata: readBoolean(value.captureMetadata, true),
    samplingRate: typeof value.samplingRate === "number" ? value.samplingRate : 1,
    redaction: {
      enabled: true,
      emails: true,
      apiKeys: true,
      ...(typeof value.redaction === "object" && value.redaction ? value.redaction : {})
    },
    ignoredSpanKinds: Array.isArray(value.ignoredSpanKinds) ? value.ignoredSpanKinds : [],
    ignoredTools: Array.isArray(value.ignoredTools) ? value.ignoredTools.filter((item) => typeof item === "string") : []
  } as TracingConfig;
}

function parseTracingConfig(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
