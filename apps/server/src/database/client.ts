import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { databaseConfig } from "../config/database.config.js";
import * as schema from "./schema.js";

fs.mkdirSync(path.dirname(databaseConfig.path), { recursive: true });

const sqlite = createClient({
  url: `file:${databaseConfig.path}`
});

await sqlite.execute("PRAGMA foreign_keys = ON");
await sqlite.executeMultiple(`
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  password_hash text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS workspaces (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS workspace_members (
  id text PRIMARY KEY NOT NULL,
  workspace_id text NOT NULL,
  user_id text NOT NULL,
  role text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY NOT NULL,
  workspace_id text,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tracing_config text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS api_keys (
  id text PRIMARY KEY NOT NULL,
  project_id text NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  last_used_at text,
  created_at text NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE TABLE IF NOT EXISTS export_destinations (
  id text PRIMARY KEY NOT NULL,
  project_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  enabled integer NOT NULL,
  endpoint text NOT NULL,
  encrypted_headers text NOT NULL,
  last_tested_at text,
  last_status text,
  last_error text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY NOT NULL,
  project_id text,
  trace_id text NOT NULL,
  name text NOT NULL,
  user_id text,
  service_name text NOT NULL,
  status text NOT NULL,
  started_at text NOT NULL,
  ended_at text,
  duration_ms integer,
  input text,
  output text,
  attributes text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS spans (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  trace_id text NOT NULL,
  parent_span_id text,
  name text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  started_at text NOT NULL,
  ended_at text,
  duration_ms integer,
  input text,
  output text,
  attributes text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  span_id text,
  name text NOT NULL,
  attributes text NOT NULL,
  occurred_at text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (span_id) REFERENCES spans(id)
);
CREATE TABLE IF NOT EXISTS errors (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  span_id text,
  name text NOT NULL,
  message text NOT NULL,
  type text,
  stack text,
  attributes text NOT NULL,
  occurred_at text NOT NULL,
  created_at text NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (span_id) REFERENCES spans(id)
);
CREATE TABLE IF NOT EXISTS usage (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  span_id text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  estimated_cost_usd real,
  created_at text NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (span_id) REFERENCES spans(id)
);
`);
await sqlite.execute("ALTER TABLE sessions ADD COLUMN project_id text").catch(() => undefined);
await sqlite.execute("ALTER TABLE projects ADD COLUMN workspace_id text").catch(() => undefined);

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

const now = new Date().toISOString();
await sqlite.execute({
  sql: `INSERT OR IGNORE INTO workspaces (id, name, slug, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)`,
  args: ["ws_default", "Default Workspace", "default", now, now]
});
await sqlite.execute({
  sql: `INSERT OR IGNORE INTO projects (id, name, slug, tracing_config, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
  args: ["proj_default", "Default Project", "default", JSON.stringify(defaultTracingConfig), now, now]
});
await sqlite.execute({
  sql: "UPDATE projects SET workspace_id = ? WHERE id = ? AND workspace_id IS NULL",
  args: ["ws_default", "proj_default"]
});
await sqlite.execute({
  sql: `INSERT OR IGNORE INTO api_keys (id, project_id, name, key_hash, key_prefix, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
  args: [
    "key_default",
    "proj_default",
    "Local development key",
    createHash("sha256").update("trllm_dev_key").digest("hex"),
    "trllm_dev",
    now
  ]
});
await sqlite.execute({
  sql: "UPDATE sessions SET project_id = ? WHERE project_id IS NULL",
  args: ["proj_default"]
});

export const db = drizzle(sqlite, { schema });

export type TraceLlmDb = typeof db;
