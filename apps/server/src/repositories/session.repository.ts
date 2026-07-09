import { desc, eq } from "drizzle-orm/sql/expressions";
import type { TraceLlmDb } from "../database/client.js";
import { sessions, type NewSessionRow, type SessionRow } from "../database/schema.js";

export class SessionRepository {
  constructor(private readonly database: TraceLlmDb) {}

  async create(row: NewSessionRow): Promise<SessionRow> {
    return this.database.insert(sessions).values(row).returning().get();
  }

  async list(projectId: string): Promise<SessionRow[]> {
    return this.database.select().from(sessions).where(eq(sessions.projectId, projectId)).orderBy(desc(sessions.startedAt)).all();
  }

  async findById(id: string): Promise<SessionRow | undefined> {
    return this.database.select().from(sessions).where(eq(sessions.id, id)).get();
  }

  async update(id: string, values: Partial<NewSessionRow>): Promise<SessionRow | undefined> {
    return this.database.update(sessions).set(values).where(eq(sessions.id, id)).returning().get();
  }
}
