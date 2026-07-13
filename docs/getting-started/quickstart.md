# Hosted Quickstart

Use this guide to send your first real AI trace to the hosted TraceLLM product.

## 1. Create A Project

Open the TraceLLM dashboard:

```text
https://tracellm.in
```

Create an account, open the dashboard, and copy a project API key from **API Keys**.

Full API keys are shown only once. If you lose one, create a new key and revoke the old key.

## 2. Install The Node SDK

```bash
npm install @use-tracellm/sdk-node
```

You can also use pnpm or yarn:

```bash
pnpm add @use-tracellm/sdk-node
```

## 3. Configure Your App

Add these values to your application environment:

```bash
TRACELLM_ENDPOINT=https://api.tracellm.in
TRACELLM_API_KEY=trllm_your_project_key
TRACELLM_SERVICE_NAME=my-ai-service
```

The API key connects traces to your project and loads your project capture policy.

## 4. Send A Trace

```ts
import { TraceLLM } from "@use-tracellm/sdk-node";

const tracellm = new TraceLLM({
  endpoint: process.env.TRACELLM_ENDPOINT,
  apiKey: process.env.TRACELLM_API_KEY,
  serviceName: process.env.TRACELLM_SERVICE_NAME ?? "my-ai-service"
});

const session = await tracellm.startSession({
  name: "Chat request",
  userId: "user_123",
  attributes: {
    workflow: "chat",
    provider: "openai",
    model: "gpt-4.1-mini"
  },
  input: "Explain vector databases in one paragraph."
});

const span = await session.startSpan({
  name: "openai.chat.complete",
  kind: "llm",
  attributes: {
    provider: "openai",
    model: "gpt-4.1-mini"
  },
  input: "Explain vector databases in one paragraph."
});

// Call your real LLM provider here.
const answer = "Vector databases store embeddings so apps can search by meaning.";

await span.end({
  status: "ok",
  usage: {
    inputTokens: 12,
    outputTokens: 18,
    totalTokens: 30
  },
  output: answer
});

await session.end({
  status: "ok",
  output: answer
});
```

## 5. Inspect The Trace

Return to the TraceLLM dashboard and open **Trace Explorer**.

You should see:

- a session named `Chat request`
- an `llm` span named `openai.chat.complete`
- duration and status
- token usage if token capture is enabled
- input/output content only if content capture is enabled

## 6. Configure Capture Policy

Open **Project Config** to choose what TraceLLM stores:

- sampling rate
- prompt and output capture
- input capture
- output capture
- token usage
- metadata
- errors
- email redaction
- API key redaction
- ignored span kinds

Configuration is project-level, so SDKs can pick up changes without redeploying your app.

## 7. Optional: Export To Your Observability Stack

Open **Exports** if you want to forward project traces to your own OTLP HTTP backend, such as SigNoz, Honeycomb, Grafana Tempo, Datadog, or an OpenTelemetry Collector.

TraceLLM remains the LLM workflow UI. External exports are for teams that also want the same trace data in their existing observability platform.
