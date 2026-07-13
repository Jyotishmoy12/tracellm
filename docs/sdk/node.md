# Node SDK Guide

The Node SDK lets application developers send LLM workflow traces to TraceLLM.

Use it in any Node.js service that calls OpenAI, Anthropic, Gemini, local models, tools, retrievers, or agent workflows.

## Install

```bash
npm install @use-tracellm/sdk-node
```

## Basic Setup

```ts
import { TraceLLM } from "@use-tracellm/sdk-node";

const tracellm = new TraceLLM({
  endpoint: process.env.TRACELLM_ENDPOINT ?? "https://api.tracellm.in",
  apiKey: process.env.TRACELLM_API_KEY,
  serviceName: "my-ai-app",
  configRefreshMs: 30_000
});
```

Required environment variables:

```bash
TRACELLM_ENDPOINT=https://api.tracellm.in
TRACELLM_API_KEY=trllm_your_project_key
```

`TRACELLM_API_KEY` identifies the user's project. The backend uses it to load that project's tracing configuration.

## Minimal Chat Completion Example

This is the first property we integrated in the chatbot app: one TraceLLM session and one LLM span around a provider call.

```ts
import { TraceLLM } from "@use-tracellm/sdk-node";

const tracellm = new TraceLLM({
  endpoint: process.env.TRACELLM_ENDPOINT ?? "https://api.tracellm.in",
  apiKey: process.env.TRACELLM_API_KEY,
  serviceName: "my-chatbot"
});

export async function answerUserQuestion(question: string) {
  const session = await tracellm.startSession({
    name: "Chatbot request",
    userId: "user_123",
    attributes: {
      app: "my-chatbot",
      workflow: "chat",
      provider: "openai",
      model: "gpt-4.1-mini"
    },
    input: question
  });

  const span = await session.startSpan({
    name: "openai.chat.complete",
    kind: "llm",
    attributes: {
      provider: "openai",
      model: "gpt-4.1-mini"
    },
    input: question
  });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: question
      })
    });

    const data = await response.json();
    const answer = data.output_text;

    await span.recordEvent({
      name: "provider.response.received",
      attributes: {
        provider: "openai",
        model: "gpt-4.1-mini",
        responseId: data.id,
        totalTokens: data.usage?.total_tokens
      }
    });

    await span.end({
      status: "ok",
      usage: {
        inputTokens: data.usage?.input_tokens,
        outputTokens: data.usage?.output_tokens,
        totalTokens: data.usage?.total_tokens
      },
      output: answer
    });

    await session.end({
      status: "ok",
      output: answer
    });

    return answer;
  } catch (error) {
    await span.recordError({
      name: "provider.request.failed",
      message: error instanceof Error ? error.message : "Unknown provider error",
      type: error instanceof Error ? error.name : "Error",
      stack: error instanceof Error ? error.stack : undefined
    });
    await span.end({ status: "error" });
    await session.end({ status: "error" });
    throw error;
  }
}
```

What this creates:

- one session named `Chatbot request`
- one LLM span named `openai.chat.complete`
- one event named `provider.response.received`
- provider and model attributes
- latency from span/session timing
- token usage if the provider returns it
- structured error records if the provider call fails
- prompt/output content only when project config allows content capture

## Start A Session

```ts
const session = await tracellm.startSession({
  name: "Support answer workflow",
  userId: "user_123",
  attributes: {
    workflow: "support-answer",
    customerTier: "pro"
  },
  input: "User question text"
});
```

Use a session for one user-visible workflow: one chat turn, one agent run, one document analysis job, or one support answer workflow.

## Start An LLM Span

```ts
const span = await session.startSpan({
  name: "openai.chat.generate",
  kind: "llm",
  attributes: {
    provider: "openai",
    model: "gpt-4.1-mini"
  },
  input: prompt
});
```

Use an LLM span for one provider/model call. For non-LLM work, use other span kinds such as `tool`, `retrieval`, `agent`, `workflow`, or `custom`.

## End A Span With Usage

```ts
await span.end({
  status: "ok",
  usage: {
    inputTokens: 120,
    outputTokens: 240,
    totalTokens: 360,
    estimatedCostUsd: 0.002
  },
  output: answer
});
```

Token usage is stored only when project config has token usage capture enabled.

When token usage capture is disabled, sessions and spans still record normally, but usage rows are ignored.

## Record Events

```ts
await span.recordEvent({
  name: "provider.request.started",
  attributes: {
    provider: "openai",
    model: "gpt-4.1-mini"
  }
});

await span.recordEvent({
  name: "llm.response.created",
  attributes: {
    responseId: "resp_123",
    answerLength: answer.length
  }
});
```

Use events for instant points in time, such as cache hits, selected tools, retrieval filters, guardrail decisions, or provider response IDs.

Common LLM lifecycle events:

- `provider.request.started`: right before the SDK calls the provider.
- `provider.response.received`: right after the provider responds.
- `llm.response.created`: after your app normalizes the provider response.
- `guardrail.checked`: after a safety or policy check.
- `cache.hit`: when the app avoids a provider call.

## Record Errors

```ts
try {
  // provider call
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

Errors are stored as structured TraceLLM error records and exported as exception-style telemetry when backend OpenTelemetry export is enabled.

Project config controls whether structured error records are stored. If `captureErrors` is disabled, the span/session can still end with `status: "error"`, but error detail records are ignored.

## End The Session

```ts
await session.end({
  status: "ok",
  output: answer,
  attributes: {
    completed: true
  }
});
```

Always end sessions and spans. Running records are useful during active work, but completed duration and status need an end call.

## Content Capture

The SDK can pass prompt and output fields, but the backend decides whether to store them.

```ts
const session = await tracellm.startSession({
  name: "Chatbot request",
  input: userMessage
});

const span = await session.startSpan({
  name: "openai.chat.complete",
  kind: "llm",
  input: userMessage
});

await span.end({
  status: "ok",
  output: assistantAnswer
});

await session.end({
  status: "ok",
  output: assistantAnswer
});
```

Project config controls what happens next:

- `captureContent`: stores both prompt and output content.
- `captureInputs`: stores input fields.
- `captureOutputs`: stores output fields.
- redaction can remove emails and API-key-like values before storage.

Default behavior is privacy-first: content capture is off unless the project enables it.

## Redaction

When content capture is enabled, TraceLLM can redact sensitive values before storage.

Project redaction config supports:

- emails
- API-key-like values such as `sk_test_123456789`

Example:

```ts
await span.end({
  status: "ok",
  output: "Contact jane@example.com with key sk_test_123456789"
});
```

With email and API-key redaction enabled, TraceLLM stores:

```text
Contact [redacted-email] with key [redacted-key]
```

Redaction happens in the TraceLLM backend before persistence. The SDK does not mutate the prompt your app sends to the LLM provider.

## What Users See

In the TraceLLM UI, users should see:

- a new session in the sessions list
- a timeline entry for each span
- status, duration, provider, model, usage, and attributes
- prompt/output content only if project config allows content capture
- errors in the timeline when provider calls fail

In SigNoz, users should see:

- exported OpenTelemetry traces from the TraceLLM backend
- span names such as `openai.chat.complete`
- duration, status, and attributes
- token usage fields as OTel attributes when available

TraceLLM is the product-level LLM observability view. SigNoz is the infrastructure trace view.

## Runtime Config Fetch

The SDK calls:

```text
GET /v1/config
```

with the project API key. The backend returns the current tracing configuration.

This means UI changes can affect SDK behavior without redeploying the application.

The SDK caches project config for `30_000` ms by default. Configure it with:

```ts
const tracellm = new TraceLLM({
  apiKey: process.env.TRACELLM_API_KEY,
  configRefreshMs: 5_000
});
```

Or with:

```bash
TRACELLM_CONFIG_REFRESH_MS=5000
```

The project config controls:

- tracing enabled or disabled
- sampling rate
- prompt/output content capture
- input capture
- output capture
- token usage capture
- error capture
- metadata capture
- email and API-key redaction
- ignored span kinds
- ignored tools

## Sampling

Sampling decides whether a new session should be recorded.

```ts
const session = await tracellm.startSession({
  name: "Chatbot request"
});
```

If project sampling is `0`, the SDK returns a no-op session and nothing is sent to TraceLLM.

If project sampling is `1`, every session is recorded.

If project sampling is `0.5`, each new session has about a 50% chance of being recorded.

Use sampling to reduce storage and noise for high-volume applications.

## Token Usage Capture

Pass usage values when ending a span:

```ts
await span.end({
  status: "ok",
  usage: {
    inputTokens: providerUsage.input_tokens,
    outputTokens: providerUsage.output_tokens,
    totalTokens: providerUsage.total_tokens,
    estimatedCostUsd: 0.002
  }
});
```

If project `captureTokenUsage` is enabled, TraceLLM stores the usage row.

If it is disabled, TraceLLM ignores the usage payload while still keeping the session and span.

Use this when users want traces without token/cost accounting.

## Metadata Capture

Metadata controls whether attributes are stored.

```ts
const session = await tracellm.startSession({
  name: "Chatbot request",
  attributes: {
    provider: "openai",
    model: "gpt-4.1-mini",
    workflow: "chat"
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
```

If project `captureMetadata` is enabled, TraceLLM stores the attributes.

If it is disabled, TraceLLM stores empty attribute objects while preserving sessions, spans, content, status, and usage according to their own settings.

## Ignored Span Kinds

Ignored span kinds let users skip categories of spans.

Available span kinds:

- `llm`
- `tool`
- `retrieval`
- `agent`
- `workflow`
- `custom`

If `llm` is ignored, this call returns a no-op span:

```ts
const span = await session.startSpan({
  name: "openai.chat.complete",
  kind: "llm"
});
```

The parent session can still be recorded and ended. Span-level events, errors, usage, input, and output attached to that ignored span are skipped.

## SDK Overrides

You can pass SDK-side overrides:

```ts
const tracellm = new TraceLLM({
  apiKey: process.env.TRACELLM_API_KEY,
  tracing: {
    samplingRate: 0.5,
    captureContent: false
  }
});
```

SDK overrides are merged with project configuration.

Prefer project config in the TraceLLM UI for normal teams. Use SDK overrides for emergency safety controls or per-service differences.

## Environment Flags Used By The Chatbot Example

The example chatbot uses one additional flag:

```bash
TRACELLM_ENABLED=true
```

That flag is app-specific. The SDK itself decides whether to trace based on project config after it is constructed and called.

The chatbot also supports optional SDK overrides:

```bash
TRACELLM_CAPTURE_CONTENT=false
TRACELLM_CAPTURE_INPUTS=false
TRACELLM_CAPTURE_OUTPUTS=false
TRACELLM_SAMPLING_RATE=1
TRACELLM_CONFIG_REFRESH_MS=30000
TRACELLM_RECORD_EVENTS=true
```

The capture and sampling flags map to SDK `tracing` overrides. `TRACELLM_CONFIG_REFRESH_MS` controls SDK config refresh. `TRACELLM_RECORD_EVENTS` is app-specific and decides whether your app calls `span.recordEvent`.
