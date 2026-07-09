# Manual Instrumentation Patterns

TraceLLM currently uses manual instrumentation. This is intentional for the first SDK because it makes the trace model explicit and provider-agnostic.

## Pattern: One User Request

Use one session per user request or workflow.

```ts
const session = await tracellm.startSession({
  name: "User asked assistant",
  userId: user.id
});
```

## Pattern: Provider Call

Wrap every model call in an `llm` span.

```ts
const span = await session.startSpan({
  name: "anthropic.chat.generate",
  kind: "llm",
  attributes: {
    provider: "anthropic",
    model
  },
  input: prompt
});

const result = await callProvider(prompt);

await span.end({
  status: "ok",
  usage: result.usage,
  output: result.text
});
```

## Pattern: Retrieval

Use `retrieval` spans for RAG operations.

```ts
const retrieval = await session.startSpan({
  name: "vector.search",
  kind: "retrieval",
  attributes: {
    index: "support-docs",
    topK: 5
  }
});
```

## Pattern: Tool Calls

Use `tool` spans for external or internal tools.

```ts
const tool = await session.startSpan({
  name: "crm.customer.lookup",
  kind: "tool",
  attributes: {
    customerId
  }
});
```

## Pattern: Intermediate Events

Use events for useful moments inside a span.

```ts
await span.recordEvent({
  name: "prompt.rendered",
  attributes: {
    template: "support-answer-v3"
  }
});
```

## Pattern: Do Not Store Secrets

Avoid putting secrets in:

- span names
- attributes
- event names
- metadata
- input/output fields

TraceLLM has redaction, but it should be the last line of defense.
