# TraceLLM

TraceLLM is an LLM observability product for tracking what AI applications do across a full workflow.

It captures sessions, spans, events, errors, token usage, latency, metadata, and optional prompt or output content. Developers send traces with the TraceLLM SDK, inspect them in the TraceLLM UI, and optionally export OpenTelemetry data to SigNoz.

## What You Can Do Today

- Create a TraceLLM account locally.
- Create project API keys.
- Configure tracing behavior per project from the UI.
- Send traces from a real Node.js application.
- Test with OpenAI, Anthropic Claude, or Gemini.
- Inspect traces in the custom TraceLLM UI.
- Export backend telemetry over OTLP to SigNoz.

## Typical Flow

```text
Create account
  -> create API key
  -> install/use SDK
  -> run app with real LLM provider
  -> inspect trace timeline in TraceLLM UI
  -> inspect exported backend telemetry in SigNoz
```

## Main Local URLs

| Tool | URL |
| --- | --- |
| TraceLLM API | `http://localhost:4319` |
| Swagger/OpenAPI | `http://localhost:4319/api-docs` |
| SigNoz UI | `http://localhost:8080` |
| SigNoz OTLP HTTP | `http://localhost:4318` |

## Start Here

If you want the fastest end-to-end test, follow [Local Quickstart](getting-started/local-quickstart.md).

If you want the full local stack with SigNoz UI, follow [Full Local Setup](getting-started/full-local-setup.md).
