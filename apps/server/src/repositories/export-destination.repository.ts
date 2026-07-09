import { and, eq } from "drizzle-orm/sql/expressions";
import type { TraceLlmDb } from "../database/client.js";
import {
  exportDestinations,
  type ExportDestinationRow,
  type NewExportDestinationRow
} from "../database/schema.js";

export class ExportDestinationRepository {
  constructor(private readonly database: TraceLlmDb) {}

  async list(projectId: string): Promise<ExportDestinationRow[]> {
    return this.database
      .select()
      .from(exportDestinations)
      .where(eq(exportDestinations.projectId, projectId))
      .all();
  }

  async listEnabled(projectId: string): Promise<ExportDestinationRow[]> {
    return this.database
      .select()
      .from(exportDestinations)
      .where(and(eq(exportDestinations.projectId, projectId), eq(exportDestinations.enabled, true)))
      .all();
  }

  async find(projectId: string, id: string): Promise<ExportDestinationRow | undefined> {
    return this.database
      .select()
      .from(exportDestinations)
      .where(and(eq(exportDestinations.projectId, projectId), eq(exportDestinations.id, id)))
      .get();
  }

  async create(row: NewExportDestinationRow): Promise<ExportDestinationRow> {
    return this.database.insert(exportDestinations).values(row).returning().get();
  }

  async update(
    projectId: string,
    id: string,
    values: Partial<NewExportDestinationRow>
  ): Promise<ExportDestinationRow | undefined> {
    return this.database
      .update(exportDestinations)
      .set(values)
      .where(and(eq(exportDestinations.projectId, projectId), eq(exportDestinations.id, id)))
      .returning()
      .get();
  }

  async delete(projectId: string, id: string): Promise<boolean> {
    const deleted = await this.database
      .delete(exportDestinations)
      .where(and(eq(exportDestinations.projectId, projectId), eq(exportDestinations.id, id)))
      .returning()
      .get();
    return Boolean(deleted);
  }
}
