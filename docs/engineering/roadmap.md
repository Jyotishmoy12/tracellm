# Roadmap

TraceLLM currently has the core product loop:

```text
account -> API key -> SDK -> traces -> custom UI -> optional SigNoz export
```

## Near-Term

- MCP server that calls backend APIs, not direct DB access.
- Better frontend filters and search.
- Span detail view.
- Session comparison.
- Project switching.
- API key scopes.
- More API tests.

## SDK

- automatic provider wrappers for OpenAI, Anthropic, and Gemini
- async queue and retry behavior
- batching
- offline/noop modes
- stronger redaction helpers
- framework examples

## Hosted Product

- production database
- migrations
- durable JWT signing keys
- organizations and roles
- billing/usage views
- rate limiting
- deployment pipeline
- managed SigNoz or cloud export configuration

## Observability

- richer OpenTelemetry mapping
- trace correlation between SDK traces and backend request traces
- metrics dashboards
- SigNoz dashboard templates
