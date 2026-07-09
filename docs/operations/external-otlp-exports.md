# Bring Your Own Observability Backend

TraceLLM always stores sessions, spans, events, errors, token usage, and capture-policy results in the TraceLLM backend so users can inspect them in the TraceLLM dashboard.

Advanced teams can also forward a copy of project traces to their own OTLP HTTP backend, such as SigNoz, Honeycomb, Grafana Tempo, Datadog OTLP ingest, or a custom OpenTelemetry Collector.

## When To Use External Exports

Use external exports when a team wants TraceLLM data inside its existing observability stack.

Common reasons:

- correlate LLM calls with application traces
- keep a customer-owned telemetry archive
- build organization-specific dashboards
- route traces through an internal OpenTelemetry Collector
- use TraceLLM as the product UI while still feeding SigNoz or another backend

Default hosted TraceLLM users do not need this setup. They can use the TraceLLM UI directly.

## Create A Destination

Open the TraceLLM dashboard and go to **Exports**.

Add:

- **Destination name**: a human label, such as `Production SigNoz`
- **OTLP HTTP endpoint**: the collector base URL
- **Headers**: optional `key=value` lines for ingestion keys or auth headers
- **Enabled**: whether new traces should be forwarded

TraceLLM sends trace payloads to:

```text
<endpoint>/v1/traces
```

Example endpoint:

```text
https://signoz.example.com:4318
```

If your provider gives a full `/v1/traces` URL, enter the base endpoint without `/v1/traces`.

## Headers

Headers are entered one per line:

```text
signoz-ingestion-key=your-key
x-honeycomb-team=your-key
authorization=Bearer your-token
```

After save, TraceLLM masks header values in API responses and the dashboard.

## Test Trace

Use **Test trace** after creating a destination.

Expected result:

- `ok`: the destination accepted a test OTLP trace
- `failed`: the destination rejected the payload, timed out, or could not be reached

A failed export does not block TraceLLM ingestion. Your application traces still appear in the TraceLLM UI.

## Provider Examples

### SigNoz

```text
https://signoz.example.com:4318
```

For SigNoz Cloud, use the OTLP ingest endpoint and add the ingestion key header provided by SigNoz.

### Honeycomb

```text
https://api.honeycomb.io
```

Add the Honeycomb team header:

```text
x-honeycomb-team=your-api-key
```

### Grafana Tempo Or OpenTelemetry Collector

```text
https://otel-collector.example.com:4318
```

Route the collector to Tempo or any downstream backend.

## Security Model

TraceLLM encrypts destination headers at rest using:

```text
TRACELLM_EXPORT_SECRET_KEY
```

Set this to a strong production secret before deployment. If this key changes, previously saved export headers cannot be decrypted and should be re-entered.

External exports are project-scoped. A destination created in one project is not visible to another project.

## Operational Notes

- External exports are best-effort.
- Export failures update destination status but do not fail SDK ingestion.
- The TraceLLM database remains the source of truth for the product UI.
- The platform-level SigNoz exporter can still run separately for TraceLLM's own internal observability.
