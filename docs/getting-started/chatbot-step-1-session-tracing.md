# Chatbot Integration Walkthrough

This guide shows how to add TraceLLM to a real chatbot one capability at a time.

The chatbot still calls the selected LLM provider directly. TraceLLM observes the workflow and records sessions, spans, events, errors, token usage, metadata, and optional content according to your project configuration.

For the reusable SDK API, read the [Node SDK Guide](../sdk/node.md).

## Baseline

Start with a chatbot that already works without TraceLLM:

- it accepts a user message
- it calls OpenAI, Anthropic, Gemini, or another provider
- it returns the provider response
- it handles provider failures

Then add TraceLLM around that existing flow.

## Step 1: Session And LLM Span

Create one session for each user-visible chat turn and one `llm` span around the provider call.

```ts
const session = await tracellm.startSession({
  name: "Chatbot request",
  userId: user.id,
  attributes: {
    app: "support-chatbot",
    provider,
    model,
    messageCount: messages.length
  },
  input: latestUserMessage
});

const span = await session.startSpan({
  name: `${provider}.chat.complete`,
  kind: "llm",
  attributes: {
    provider,
    model
  },
  input: latestUserMessage
});
```

Expected result in TraceLLM:

- one session named `Chatbot request`
- one LLM span named like `openai.chat.complete`
- provider and model metadata when metadata capture is enabled
- prompt/output content only when content capture allows it

## Step 2: Lifecycle Events

Record events for important moments around the provider call.

```ts
await span.recordEvent({
  name: "provider.request.started",
  attributes: { provider, model }
});

const response = await callProvider(messages);

await span.recordEvent({
  name: "provider.response.received",
  attributes: {
    provider,
    model,
    responseId: response.id,
    totalTokens: response.usage?.totalTokens
  }
});
```

Expected result:

- timeline shows provider start and provider response events
- exported traces can show these as OpenTelemetry span events when export settings allow events

## Step 3: Content Capture

Pass input and output to TraceLLM, then let project config decide whether to store it.

```ts
await span.end({
  status: "ok",
  output: assistantAnswer
});

await session.end({
  status: "ok",
  output: assistantAnswer
});
```

Project config controls:

- `Capture prompt/output content`
- `Capture inputs`
- `Capture outputs`

Default behavior is privacy-first: content is not stored unless your project enables it.

## Step 4: Redaction

When content capture is enabled, turn on:

- `Redact emails`
- `Redact API keys`

Then test with a message such as:

```text
Please summarize this contact: jane@example.com. My temporary key is sk_test_123456789.
```

Expected result:

- stored content contains `[redacted-email]`
- stored content contains `[redacted-key]`
- the prompt sent to your LLM provider is not changed by TraceLLM redaction

## Step 5: Error Capture

Wrap provider failures and record structured errors.

```ts
try {
  const response = await callProvider(messages);
  await span.end({ status: "ok", output: response.text });
  await session.end({ status: "ok", output: response.text });
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
```

Expected result:

- session status becomes `error`
- LLM span status becomes `error`
- timeline includes a structured error record when error capture is enabled
- external OTLP exports can include exception-style telemetry when export settings allow errors

## Step 6: Sampling

Sampling controls how often new sessions are recorded.

- `100%`: every request creates a session
- `0%`: no new request creates a session
- `50%`: roughly half of new requests create sessions over time

Sampling affects new requests only. It does not delete older traces.

## Step 7: Token Usage

End the LLM span with provider usage when available.

```ts
await span.end({
  status: "ok",
  usage: {
    inputTokens: response.usage?.inputTokens,
    outputTokens: response.usage?.outputTokens,
    totalTokens: response.usage?.totalTokens
  },
  output: assistantAnswer
});
```

Expected result:

- total tokens appear in the session summary when token usage capture is enabled
- usage is ignored when token usage capture is disabled
- sessions and spans still record normally when token usage is off

## Step 8: Metadata

Metadata is stored from `attributes` on sessions, spans, and events.

Useful chatbot metadata:

- provider
- model
- route or workflow name
- message count
- customer tier
- retrieval document count
- tool names

When metadata capture is disabled, TraceLLM keeps the trace structure but stores empty attribute objects.

## Step 9: Ignored Span Kinds

Ignored span kinds let you skip categories of work.

Available span kinds:

- `llm`
- `tool`
- `retrieval`
- `agent`
- `workflow`
- `custom`

If `llm` is ignored, LLM spans and their attached events/errors are skipped. The parent session can still be recorded.

## Step 10: External Export

Open **Exports** to forward a copy of selected trace data to your own OTLP HTTP backend.

Per-destination export settings can include or exclude:

- spans
- events
- errors
- token usage
- metadata
- content
- span kinds

TraceLLM remains the source of truth for LLM workflow debugging. External exports help teams correlate TraceLLM data with the rest of their observability stack.
