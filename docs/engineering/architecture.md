# Architecture

TraceLLM is a pnpm monorepo.

```text
apps/
  server/   Express API, SQLite, OpenTelemetry
  web/      React UI
packages/
  sdk-node/ Node SDK
  shared/   shared Zod schemas and types
examples/
  user-app/ real provider example
infra/
  docker-compose.yml TraceLLM backend
  signoz/ official SigNoz Foundry setup
```

## Backend Layers

The backend uses a layered Express architecture:

```text
controllers -> services -> repositories -> database
```

Layer rules:

- Controllers handle HTTP only.
- Validators validate request DTOs.
- Services contain business logic.
- Repositories are the only layer that talks to Drizzle/SQLite.
- Telemetry maps TraceLLM records to OpenTelemetry.

## Data Model

Core tables:

- `users`
- `workspaces`
- `workspace_members`
- `projects`
- `api_keys`
- `sessions`
- `spans`
- `events`
- `errors`
- `usage`

## Authentication

Browser auth:

- email/password
- Argon2id password hashing
- HttpOnly cookie
- RS256 JWT

SDK auth:

- project API key
- sent with `Authorization: Bearer <key>`
- hashed server-side before persistence

## Telemetry Flow

```text
User app
  -> TraceLLM SDK
  -> TraceLLM backend
  -> SQLite persistence
  -> TraceLLM UI
  -> OpenTelemetry export
  -> SigNoz
```

## OpenTelemetry

The backend initializes OpenTelemetry on startup.

It exports:

- traces to `/v1/traces`
- metrics to `/v1/metrics`

The endpoint is controlled by:

```text
TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT
```
