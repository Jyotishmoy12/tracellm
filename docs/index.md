# TraceLLM

TraceLLM is an LLM observability product for tracking what AI applications do across a full workflow.

It captures sessions, spans, events, errors, token usage, latency, metadata, and optional prompt or output content. Developers send traces with the TraceLLM SDK, inspect them in the TraceLLM UI, and optionally export OpenTelemetry data to SigNoz.

## What You Can Do Today

- Create a TraceLLM account.
- Create project API keys.
- Configure tracing behavior per project from the UI.
- Send traces from a real Node.js application.
- Test with OpenAI, Anthropic Claude, or Gemini.
- Inspect traces in the custom TraceLLM UI.
- Export project traces over OTLP HTTP to your own observability backend.

## Typical Flow

```text
Create account
  -> create API key
  -> install SDK
  -> run app with real LLM provider
  -> inspect trace timeline in TraceLLM UI
  -> optionally export traces to SigNoz or another OTLP backend
```

## Hosted URLs

| Tool | URL |
| --- | --- |
| TraceLLM App | `https://tracellm.in` |
| TraceLLM API | `https://api.tracellm.in` |
| API Docs | `https://api.tracellm.in/api-docs` |

## Start Here

Start with the [Hosted Quickstart](getting-started/quickstart.md).

Then read the [Node SDK Guide](sdk/node.md) and [Testing With Real LLM Providers](getting-started/provider-testing.md).
