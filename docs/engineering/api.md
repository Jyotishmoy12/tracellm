# API Overview

Swagger UI is available locally at:

```text
http://localhost:4319/api-docs
```

Raw OpenAPI JSON:

```text
http://localhost:4319/openapi.json
```

## Health

```text
GET /health
GET /health/live
GET /health/ready
```

## Auth

```text
POST /v1/auth/register
POST /v1/auth/login
GET  /v1/auth/me
POST /v1/auth/logout
```

Browser auth uses an HttpOnly cookie.

## Project Config

```text
GET    /v1/config
GET    /v1/projects/current/config
PUT    /v1/projects/current/config
GET    /v1/projects/current/api-keys
POST   /v1/projects/current/api-keys
DELETE /v1/projects/current/api-keys/:keyId
```

SDKs use `/v1/config` to fetch tracing configuration.

## Sessions

```text
POST /v1/sessions
GET  /v1/sessions
GET  /v1/sessions/:sessionId
GET  /v1/sessions/:sessionId/timeline
POST /v1/sessions/:sessionId/end
```

## Spans

```text
POST /v1/spans
GET  /v1/spans/:spanId
POST /v1/spans/:spanId/end
```

## Events And Errors

```text
POST /v1/events
POST /v1/errors
```

## Authentication Modes

Browser dashboard APIs use the session cookie.

SDK ingest APIs use a TraceLLM API key:

```http
Authorization: Bearer trllm_...
```
