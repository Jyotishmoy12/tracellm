import { Algorithm, hash, verify } from "@node-rs/argon2";
import type { LoginRequest, RegisterRequest } from "@tracellm/shared";
import { HttpError } from "../middleware/error.middleware.js";
import type { AuthRepository } from "../repositories/auth.repository.js";
import type { ProjectRepository } from "../repositories/project.repository.js";
import { createId } from "../utils/ids.js";
import { JwtService } from "./jwt.service.js";

const defaultTracingConfig = {
  enabled: true,
  captureContent: false,
  captureInputs: false,
  captureOutputs: false,
  captureToolCalls: true,
  captureRetrieval: true,
  captureErrors: true,
  captureTokenUsage: true,
  captureLatency: true,
  captureMetadata: true,
  samplingRate: 1,
  redaction: {
    enabled: true,
    emails: true,
    apiKeys: true
  },
  ignoredSpanKinds: [],
  ignoredTools: []
};

export class AuthService {
  constructor(
    private readonly auth: AuthRepository,
    private readonly projects: ProjectRepository,
    private readonly jwt: JwtService
  ) {}

  async register(payload: RegisterRequest) {
    const email = payload.email.toLowerCase();
    const existing = await this.auth.findUserByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email is already registered");
    }

    const now = new Date().toISOString();
    const user = await this.auth.createUser({
      id: createId("usr"),
      email,
      name: payload.name ?? null,
      passwordHash: await hashPassword(payload.password),
      createdAt: now,
      updatedAt: now
    });

    const workspaceName = payload.workspaceName ?? `${payload.name ?? email}'s Workspace`;
    const workspace = await this.auth.createWorkspace({
      id: createId("ws"),
      name: workspaceName,
      slug: `${slugify(workspaceName)}-${user.id.slice(-6)}`,
      createdAt: now,
      updatedAt: now
    });

    await this.auth.createMembership({
      id: createId("mem"),
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
      createdAt: now
    });

    const project = await this.auth.createProject({
      id: createId("proj"),
      workspaceId: workspace.id,
      name: "Default Project",
      slug: `default-${user.id.slice(-6)}`,
      tracingConfig: defaultTracingConfig,
      createdAt: now,
      updatedAt: now
    });

    await this.projects.createApiKey(project.id, "Default SDK key");

    return this.toAuthResponse(user.id, user.email);
  }

  async login(payload: LoginRequest) {
    const user = await this.auth.findUserByEmail(payload.email.toLowerCase());
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const validPassword = await verify(user.passwordHash, payload.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid email or password");
    }

    return this.toAuthResponse(user.id, user.email);
  }

  async me(userId: string) {
    const workspace = await this.auth.findDefaultWorkspaceForUser(userId);
    if (!workspace) {
      throw new HttpError(401, "Session is no longer valid");
    }

    return {
      user: {
        id: workspace.user.id,
        email: workspace.user.email,
        name: workspace.user.name
      },
      workspace: {
        id: workspace.workspace.id,
        name: workspace.workspace.name
      },
      project: {
        id: workspace.project.id,
        name: workspace.project.name
      }
    };
  }

  private async toAuthResponse(userId: string, email: string) {
    return {
      token: await this.jwt.signSession({ userId, email }),
      user: {
        id: userId,
        email
      }
    };
  }
}

async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
