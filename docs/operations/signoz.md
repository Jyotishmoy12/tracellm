# SigNoz Integration

TraceLLM can forward project traces to SigNoz over OTLP HTTP.

The TraceLLM dashboard remains the LLM workflow UI. SigNoz gives broader OpenTelemetry visibility for teams that already use it.

## Hosted TraceLLM Behavior

By default, you do not need SigNoz access to use TraceLLM.

Your sessions, spans, events, errors, usage, and capture policy results appear in the TraceLLM UI.

## SigNoz Cloud

To send a copy to SigNoz Cloud, open **Exports** in TraceLLM and create an OTLP HTTP destination.

Endpoint:

```text
https://ingest.<region>.signoz.cloud:443
```

Headers:

```text
signoz-ingestion-key=<your-ingestion-key>
```

Use **Send test trace** to confirm SigNoz accepts the payload.

## What To Look For

In SigNoz, search for the service name your SDK sends, or the service name shown by the exported trace.

TraceLLM exports include:

- span names such as `openai.chat.complete`
- span kinds such as `llm`, `tool`, `retrieval`, `agent`, `workflow`, and `custom`
- duration and status
- selected attributes and metadata, depending on export settings
- token usage fields when enabled
- exception-style events for captured errors

## Export Controls

Each export destination can choose what to forward:

- spans
- events
- errors
- token usage
- metadata
- content
- selected span kinds

## Common Confusion

You will not see the same product timeline in SigNoz that you see in TraceLLM.

TraceLLM UI is optimized for LLM sessions, spans, events, errors, and project config.

SigNoz is optimized for service-level observability.
