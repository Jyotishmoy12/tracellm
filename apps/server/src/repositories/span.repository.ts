import { asc, eq } from "drizzle-orm/sql/expressions";
import type { TraceLlmDb } from "../database/client.js";
import { spans, usage, type NewSpanRow, type NewUsageRow, type SpanRow, type UsageRow } from "../database/schema.js";

export class SpanRepository {
  constructor(private readonly database: TraceLlmDb) {}

  async create(row: NewSpanRow): Promise<SpanRow> {
    return this.database.insert(spans).values(row).returning().get();
  }

  async findById(id: string): Promise<SpanRow | undefined> {
    return this.database.select().from(spans).where(eq(spans.id, id)).get();
  }

  async listBySession(sessionId: string): Promise<SpanRow[]> {
    return this.database.select().from(spans).where(eq(spans.sessionId, sessionId)).orderBy(asc(spans.startedAt)).all();
  }

  async update(id: string, values: Partial<NewSpanRow>): Promise<SpanRow | undefined> {
    return this.database.update(spans).set(values).where(eq(spans.id, id)).returning().get();
  }

  async createUsage(row: NewUsageRow): Promise<UsageRow> {
    return this.database.insert(usage).values(row).returning().get();
  }

  async listUsageBySession(sessionId: string): Promise<UsageRow[]> {
    return this.database.select().from(usage).where(eq(usage.sessionId, sessionId)).all();
  }
}
