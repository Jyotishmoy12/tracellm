# TraceLLM

TraceLLM is an observability platform for AI applications. It helps teams see what their LLM-powered systems are doing across sessions, spans, events, errors, token usage, latency, metadata, and optional prompt/output content.

It is built for real AI apps: chatbots, agents, RAG pipelines, model routers, internal tools, provider wrappers, and custom AI workflows.

## What TraceLLM Solves

AI workflows are hard to debug because the important details are usually spread across logs, provider dashboards, user reports, and application code. TraceLLM gives each workflow a single trace timeline so you can answer:

- What user/session triggered this AI workflow?
- Which model/provider call happened?
- How long did each step take?
- How many tokens were used?
- Which spans, events, metadata, and errors happened?
- Was prompt/output content captured or intentionally excluded?
- Can this trace also be exported to OpenTelemetry/SigNoz?

TraceLLM keeps product-level trace history in its own UI and can export telemetry to OTLP-compatible backends.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, MVC/layered architecture
- **Database:** SQLite with Drizzle ORM
- **Auth:** email/password, Argon2id hashing, JWT in HttpOnly cookies
- **API Docs:** Swagger/OpenAPI generated from Zod schemas
- **Telemetry:** OpenTelemetry OTLP HTTP export with SigNoz support
- **SDK:** Node.js SDK package under `packages/sdk-node`
- **Frontend:** React, Vite, React Query, Tailwind CSS
- **Docs:** MkDocs Material
- **Infra:** Docker Compose, Caddy, Hostinger VPS, Vercel

## Live Links

- App: https://tracellm.in
- Docs: https://docs.tracellm.in
- API health: https://api.tracellm.in/health
- Swagger/OpenAPI: https://api.tracellm.in/api-docs
- Private SigNoz: https://signoz.tracellm.in

## Basic SDK Example

The SDK is intended to be used from user applications like this:

```ts
import { TraceLLM } from "@tracellm/sdk-node";

const tracellm = new TraceLLM({
  endpoint: process.env.TRACELLM_ENDPOINT ?? "https://api.tracellm.in",
  apiKey: process.env.TRACELLM_API_KEY!,
  serviceName: "my-ai-app",
  captureContent: false
});

const session = await tracellm.startSession({
  name: "Chat request",
  userId: "user_123",
  attributes: {
    route: "/chat",
    provider: "openai"
  }
});

const span = await session.startSpan({
  name: "openai.chat.complete",
  kind: "llm",
  attributes: {
    provider: "openai",
    model: "gpt-4.1-mini"
  }
});

try {
  // Call OpenAI, Anthropic, Gemini, a router, or your own AI service here.
  await span.recordEvent({
    name: "provider.response.received",
    attributes: {
      outputTokens: 42
    }
  });

  await span.end({ status: "ok" });
  await session.end({ status: "ok" });
} catch (error) {
  await span.recordError({
    name: "provider.request.failed",
    message: error instanceof Error ? error.message : "Unknown error",
    type: error instanceof Error ? error.name : "Error",
    stack: error instanceof Error ? error.stack : undefined
  });

  await span.end({ status: "error" });
  await session.end({ status: "error" });
}
```

Install command after the SDK is published:

```bash
pnpm add @tracellm/sdk-node
```

Until the package is published to npm, use the workspace package locally from this monorepo.

## Quick Local Run

```powershell
pnpm install
pnpm infra:build
pnpm infra:up
pnpm dev:web
```

Open the web app at:

```text
http://localhost:5173
```

Create an account, create/copy an API key, then run the real provider example:

```powershell
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_key"
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_openai_key"
pnpm example:user-app
```

## Local SigNoz

Generate and start the local SigNoz stack:

```powershell
pnpm signoz:forge
pnpm signoz:up
```

Open:

```text
http://localhost:8080
```

## Documentation

Install docs dependencies:

```powershell
python -m pip install -r docs/requirements.txt
```

Serve docs locally:

```powershell
pnpm docs:serve
```

Open:

```text
http://127.0.0.1:8000
```

Key docs:

- [Local Quickstart](docs/getting-started/local-quickstart.md)
- [Full Local Setup](docs/getting-started/full-local-setup.md)
- [Provider Testing](docs/getting-started/provider-testing.md)
- [Node SDK Guide](docs/sdk/node.md)
- [Customization Options](docs/product/customization.md)
- [External OTLP Exports](docs/operations/external-otlp-exports.md)
- [VPS Deployment](docs/operations/vps-deployment.md)
- [SigNoz Integration](docs/operations/signoz.md)

## Repository Structure

```text
apps/
  server/   Express API, auth, persistence, telemetry
  web/      React dashboard and landing page
  chatbot/  Real chatbot test app

packages/
  sdk-node/ Node.js SDK
  shared/   shared DTOs, Zod schemas, types

docs/       MkDocs Material documentation
infra/      Docker Compose, Caddy, SigNoz, production setup
examples/   local SDK examples
```

## License

License is not finalized yet. Add a `LICENSE` file before publishing the SDK package or accepting external production use.
