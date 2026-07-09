# Customization Options

TraceLLM is designed so teams can tune observability without constantly changing application code. The project configuration is managed from the UI and fetched by the SDK.

## Tracing Enabled

Controls whether the SDK should send traces.

When disabled:

- new sessions can become no-op sessions
- spans/events/errors are ignored by the SDK or backend
- application code can keep calling the SDK safely

Use this when:

- debugging noisy local environments
- disabling tracing for a sensitive customer
- reducing observability overhead

## Capture Prompt/Output Content

Controls whether TraceLLM can store prompt and output text.

Default: off.

When off:

- `input` and `output` content is stripped or stored as `null`
- metadata, timing, token counts, and status can still be captured

Turn it on only when:

- you need prompt/output debugging
- your data handling policy allows it
- redaction settings are enabled as needed

## Capture Inputs

Controls whether input fields may be stored.

This is narrower than full content capture. It is useful when teams want prompt/request visibility but not generated output storage.

## Capture Outputs

Controls whether output fields may be stored.

This is useful when debugging answer quality or response formatting.

## Errors

Controls structured error capture.

When enabled, TraceLLM records:

- error name
- error message
- error type
- optional stack, depending on content capture

Keep this enabled for most environments. It is high signal and usually low data volume.

## Token Usage

Controls token usage capture.

Token usage fields:

- `inputTokens`
- `outputTokens`
- `totalTokens`
- optional `estimatedCostUsd`

Use this for:

- cost visibility
- model comparison
- quota management
- usage-based billing later

## Metadata

Controls arbitrary attributes on sessions, spans, events, and errors.

Good metadata examples:

```json
{
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "customerTier": "pro",
  "workflow": "support-answer"
}
```

Avoid putting secrets or raw user content into metadata.

## Sampling Rate

Controls how often the SDK traces workflows.

Values:

- `1`: trace every sampled operation
- `0.5`: trace about half
- `0`: trace none

Use sampling when:

- traffic is high
- you want production visibility without storing everything
- you want to reduce cost or storage

## Redact Emails

Replaces email-like strings in captured content.

Example:

```text
alice@example.com -> [redacted-email]
```

## Redact API Keys

Replaces API-key-like strings in captured content.

Example:

```text
sk_abc123... -> [redacted-key]
```

## Ignored Span Kinds

Lets the project ignore whole categories of spans.

Examples:

- keep only `llm` spans for a minimal view
- ignore future `retrieval` spans in a high-volume RAG system
- ignore future `tool` spans for noisy internal operations

Tool and retrieval span kinds are supported by the data model and SDK API, but their dedicated UI controls are intentionally hidden until the demo app emits real tool/retrieval spans.

## Ignored Tools

Reserved for filtering specific tool names.

Example future usage:

```json
{
  "ignoredTools": ["healthcheck", "cache.get"]
}
```

This is useful when some tools are noisy and not useful for LLM debugging.
