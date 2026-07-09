# SigNoz Integration

TraceLLM exports OpenTelemetry data over OTLP HTTP.

The custom TraceLLM UI remains the LLM workflow UI. SigNoz gives broader OpenTelemetry visibility for backend telemetry.

## Local SigNoz UI

Generate the official SigNoz stack:

```powershell
pnpm signoz:forge
```

Start it:

```powershell
pnpm signoz:up
```

Open:

```text
http://localhost:8080
```

On first launch, create the SigNoz admin account.

## TraceLLM Export Endpoint

When TraceLLM runs in Docker, it exports to:

```text
http://host.docker.internal:4318
```

This reaches SigNoz's OTLP HTTP receiver on the host.

The backend health response shows the active telemetry URLs:

```text
http://localhost:4319/health
```

## SigNoz Cloud

For SigNoz Cloud, configure:

```powershell
$env:TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.<region>.signoz.cloud:443"
$env:TRACELLM_OTEL_EXPORTER_OTLP_HEADERS="signoz-ingestion-key=<your-ingestion-key>"
```

In Docker Compose, set the same environment values under `tracellm-server`.

## What To Look For

In SigNoz, look for service:

```text
tracellm-server
```

The current backend exports:

- completed TraceLLM spans
- TraceLLM events as OTel spans/events
- structured errors
- request count metrics
- token count metrics
- span duration histograms

## Common Confusion

You will not see the same product timeline in SigNoz that you see in TraceLLM.

TraceLLM UI is optimized for LLM sessions, spans, events, errors, and project config.

SigNoz is optimized for service-level observability.
