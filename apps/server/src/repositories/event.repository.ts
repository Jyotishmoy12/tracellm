import { asc, eq } from "drizzle-orm/sql/expressions";
import type { TraceLlmDb } from "../database/client.js";
import {
  errors,
  events,
  type ErrorRow,
  type EventRow,
  type NewErrorRow,
  type NewEventRow
} from "../database/schema.js";

export class EventRepository {
  constructor(private readonly database: TraceLlmDb) {}

  async createEvent(row: NewEventRow): Promise<EventRow> {
    return this.database.insert(events).values(row).returning().get();
  }

  async listEventsBySession(sessionId: string): Promise<EventRow[]> {
    return this.database.select().from(events).where(eq(events.sessionId, sessionId)).orderBy(asc(events.occurredAt)).all();
  }

  async createError(row: NewErrorRow): Promise<ErrorRow> {
    return this.database.insert(errors).values(row).returning().get();
  }

  async listErrorsBySession(sessionId: string): Promise<ErrorRow[]> {
    return this.database.select().from(errors).where(eq(errors.sessionId, sessionId)).orderBy(asc(errors.occurredAt)).all();
  }
}
