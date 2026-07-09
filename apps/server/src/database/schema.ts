import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const workspaceMembers = sqliteTable("workspace_members", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["owner", "admin", "member", "viewer"] }).notNull(),
  createdAt: text("created_at").notNull()
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tracingConfig: text("tracing_config", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPrefix: text("key_prefix").notNull(),
  lastUsedAt: text("last_used_at"),
  createdAt: text("created_at").notNull()
});

export const exportDestinations = sqliteTable("export_destinations", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  type: text("type", { enum: ["otlp_http"] }).notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull(),
  endpoint: text("endpoint").notNull(),
  encryptedHeaders: text("encrypted_headers").notNull(),
  lastTestedAt: text("last_tested_at"),
  lastStatus: text("last_status", { enum: ["ok", "failed"] }),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id),
  traceId: text("trace_id").notNull(),
  name: text("name").notNull(),
  userId: text("user_id"),
  serviceName: text("service_name").notNull(),
  status: text("status", { enum: ["ok", "error", "cancelled", "running"] }).notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationMs: integer("duration_ms"),
  input: text("input"),
  output: text("output"),
  attributes: text("attributes", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const spans = sqliteTable("spans", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  traceId: text("trace_id").notNull(),
  parentSpanId: text("parent_span_id"),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["llm", "tool", "retrieval", "agent", "workflow", "custom"] }).notNull(),
  status: text("status", { enum: ["ok", "error", "cancelled", "running"] }).notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationMs: integer("duration_ms"),
  input: text("input"),
  output: text("output"),
  attributes: text("attributes", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  spanId: text("span_id").references(() => spans.id),
  name: text("name").notNull(),
  attributes: text("attributes", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  occurredAt: text("occurred_at").notNull(),
  createdAt: text("created_at").notNull()
});

export const errors = sqliteTable("errors", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  spanId: text("span_id").references(() => spans.id),
  name: text("name").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  stack: text("stack"),
  attributes: text("attributes", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  occurredAt: text("occurred_at").notNull(),
  createdAt: text("created_at").notNull()
});

export const usage = sqliteTable("usage", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  spanId: text("span_id").references(() => spans.id),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  estimatedCostUsd: real("estimated_cost_usd"),
  createdAt: text("created_at").notNull()
});

export type SessionRow = typeof sessions.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type WorkspaceRow = typeof workspaces.$inferSelect;
export type NewWorkspaceRow = typeof workspaces.$inferInsert;
export type WorkspaceMemberRow = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMemberRow = typeof workspaceMembers.$inferInsert;
export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type ApiKeyRow = typeof apiKeys.$inferSelect;
export type NewApiKeyRow = typeof apiKeys.$inferInsert;
export type ExportDestinationRow = typeof exportDestinations.$inferSelect;
export type NewExportDestinationRow = typeof exportDestinations.$inferInsert;
export type NewSessionRow = typeof sessions.$inferInsert;
export type SpanRow = typeof spans.$inferSelect;
export type NewSpanRow = typeof spans.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type ErrorRow = typeof errors.$inferSelect;
export type NewErrorRow = typeof errors.$inferInsert;
export type UsageRow = typeof usage.$inferSelect;
export type NewUsageRow = typeof usage.$inferInsert;
