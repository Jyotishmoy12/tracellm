# @tracellm/sdk-node

Node.js SDK for sending AI workflow traces to TraceLLM.

## Install

```bash
pnpm add @tracellm/sdk-node
```

## Usage

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

## Environment Variables

```text
TRACELLM_ENDPOINT=https://api.tracellm.in
TRACELLM_API_KEY=trllm_your_project_key
TRACELLM_SERVICE_NAME=my-ai-app
TRACELLM_CONFIG_REFRESH_MS=30000
```

## Links

- App: https://tracellm.in
- Docs: https://docs.tracellm.in
- SDK guide: https://docs.tracellm.in/sdk/node/
