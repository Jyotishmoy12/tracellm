import { eq } from "drizzle-orm/sql/expressions";
import type { TraceLlmDb } from "../database/client.js";
import {
  projects,
  users,
  workspaces,
  workspaceMembers,
  type NewProjectRow,
  type NewUserRow,
  type NewWorkspaceMemberRow,
  type NewWorkspaceRow,
  type ProjectRow,
  type UserRow,
  type WorkspaceRow
} from "../database/schema.js";

export interface UserWorkspace {
  user: UserRow;
  workspace: WorkspaceRow;
  project: ProjectRow;
}

export class AuthRepository {
  constructor(private readonly database: TraceLlmDb) {}

  async findUserByEmail(email: string): Promise<UserRow | undefined> {
    return this.database.select().from(users).where(eq(users.email, email.toLowerCase())).get();
  }

  async findUserById(userId: string): Promise<UserRow | undefined> {
    return this.database.select().from(users).where(eq(users.id, userId)).get();
  }

  async createUser(row: NewUserRow): Promise<UserRow> {
    return this.database.insert(users).values(row).returning().get();
  }

  async createWorkspace(row: NewWorkspaceRow): Promise<WorkspaceRow> {
    return this.database.insert(workspaces).values(row).returning().get();
  }

  async createMembership(row: NewWorkspaceMemberRow) {
    return this.database.insert(workspaceMembers).values(row).returning().get();
  }

  async createProject(row: NewProjectRow): Promise<ProjectRow> {
    return this.database.insert(projects).values(row).returning().get();
  }

  async findDefaultWorkspaceForUser(userId: string): Promise<UserWorkspace | undefined> {
    const user = await this.findUserById(userId);
    if (!user) {
      return undefined;
    }

    const membership = await this.database
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .get();
    if (!membership) {
      return undefined;
    }

    const workspace = await this.database
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, membership.workspaceId))
      .get();
    if (!workspace) {
      return undefined;
    }

    const project = await this.database
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id))
      .get();
    if (!project) {
      return undefined;
    }

    return { user, workspace, project };
  }
}
