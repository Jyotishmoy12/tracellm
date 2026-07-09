# Environment Variables

## Backend

| Variable | Default | Purpose |
| --- | --- | --- |
| `TRACELLM_PORT` | `4319` | Backend HTTP port |
| `TRACELLM_PUBLIC_API_URL` | `http://localhost:4319` | Public backend URL used in logs and OpenAPI |
| `TRACELLM_DB_PATH` | `./data/tracellm.sqlite` | SQLite database path |
| `TRACELLM_OTEL_ENABLED` | `true` | Enable OpenTelemetry export |
| `TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | OTLP HTTP endpoint |
| `TRACELLM_OTEL_EXPORTER_OTLP_HEADERS` | empty | Comma-separated OTLP headers |
| `TRACELLM_SERVICE_NAME` | `tracellm-server` | OTel service name |
| `TRACELLM_CAPTURE_CONTENT` | `false` | Server-side default content capture flag |
| `TRACELLM_AUTH_REQUIRED` | `false` | Require API key auth for all project APIs |
| `TRACELLM_DEV_API_KEY` | `trllm_dev_key` | Local development fallback key |
| `TRACELLM_AUTH_COOKIE_NAME` | `tracellm_session` | Browser auth cookie name |
| `TRACELLM_AUTH_COOKIE_SECURE` | `false` | Secure cookie flag |
| `TRACELLM_JWT_ISSUER` | `tracellm` | JWT issuer |
| `TRACELLM_JWT_AUDIENCE` | `tracellm-web` | JWT audience |
| `TRACELLM_JWT_TTL_SECONDS` | `604800` | Browser session TTL |
| `TRACELLM_EXPORT_SECRET_KEY` | local dev secret | Encryption key for external OTLP export headers |

## Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Public backend API URL |
| `VITE_DEV_PROXY_TARGET` | Local Vite proxy target |
| `VITE_DOCS_BASE_URL` | Documentation site URL |
| `VITE_OPENAPI_URL` | Swagger/OpenAPI URL |
| `VITE_DEFAULT_OTLP_ENDPOINT` | Optional default endpoint shown in the Exports form |

## Production Defaults For `tracellm.in`

Backend:

```text
TRACELLM_PUBLIC_API_URL=https://api.tracellm.in
TRACELLM_DB_PATH=/app/data/tracellm.sqlite
TRACELLM_AUTH_REQUIRED=true
TRACELLM_AUTH_COOKIE_SECURE=true
TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-ingester:4318
```

Frontend:

```text
VITE_API_BASE_URL=https://api.tracellm.in
VITE_DOCS_BASE_URL=https://docs.tracellm.in
VITE_OPENAPI_URL=https://api.tracellm.in/api-docs
VITE_DEFAULT_OTLP_ENDPOINT=http://localhost:4318
```

## SDK

| Variable | Purpose |
| --- | --- |
| `TRACELLM_ENDPOINT` | Backend URL, for example `http://localhost:4319` |
| `TRACELLM_API_KEY` | Project API key from TraceLLM UI |
| `TRACELLM_SERVICE_NAME` | Application service name |

## Example User App

| Variable | Purpose |
| --- | --- |
| `LLM_PROVIDER` | `openai`, `anthropic`, or `gemini` |
| `OPENAI_API_KEY` | OpenAI key |
| `OPENAI_MODEL` | OpenAI model |
| `ANTHROPIC_API_KEY` | Anthropic key |
| `ANTHROPIC_MODEL` | Anthropic model |
| `GEMINI_API_KEY` | Gemini key |
| `GEMINI_MODEL` | Gemini model |
| `USER_APP_CUSTOMER_ID` | Customer id used by the example |

## SigNoz Cloud Headers

Use `TRACELLM_OTEL_EXPORTER_OTLP_HEADERS` for vendor headers.

Example:

```text
signoz-ingestion-key=<your-ingestion-key>
```

Multiple headers are comma-separated:

```text
header-one=value-one,header-two=value-two
```
