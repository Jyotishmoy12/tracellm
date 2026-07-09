# TraceLLM

TraceLLM is an LLM observability product for tracking real AI application workflows.

It gives teams a custom trace timeline for sessions, spans, events, errors, token usage, latency, metadata, and optional prompt/output content. It also exports OpenTelemetry data to SigNoz.

## What Is Implemented

- Express + TypeScript backend
- SQLite persistence with Drizzle
- Swagger/OpenAPI
- email/password auth with HttpOnly JWT cookie
- Argon2id password hashing
- project API keys for SDK ingestion
- configurable project tracing settings
- Node.js SDK
- React TraceLLM UI
- real user-app example with OpenAI, Anthropic, or Gemini
- local SigNoz UI setup through official SigNoz Foundry
- MkDocs Material documentation site

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

## Quick Local Run

```powershell
pnpm install
pnpm infra:build
pnpm infra:up
pnpm dev:web
```

Open the web app at the Vite URL, usually:

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

## SigNoz

Generate and start the official local SigNoz stack:

```powershell
pnpm signoz:forge
pnpm signoz:up
```

Open:

```text
http://localhost:8080
```

TraceLLM Docker exports to SigNoz through:

```text
http://host.docker.internal:4318
```

## Important Docs

- `docs/getting-started/local-quickstart.md`
- `docs/getting-started/full-local-setup.md`
- `docs/getting-started/provider-testing.md`
- `docs/product/customization.md`
- `docs/operations/vps-deployment.md`
- `docs/operations/signoz.md`
