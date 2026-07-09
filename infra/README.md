# TraceLLM Infrastructure

This folder contains the local TraceLLM backend Docker stack.

Production VPS deployment files live in `infra/production`.

## Services

- `tracellm-server`: Express backend on `http://localhost:4319`
SigNoz UI runs separately from `infra/signoz` using the official SigNoz Foundry-generated Compose stack.

## Start

```bash
pnpm infra:up
```

Then open:

- TraceLLM Swagger: `http://localhost:4319/api-docs`
- TraceLLM health: `http://localhost:4319/health`

## Stop

```bash
pnpm infra:down
```

## Notes

This stack wires TraceLLM to a SigNoz OpenTelemetry collector-compatible endpoint.
For local SigNoz UI, first start the official SigNoz stack:

```bash
pnpm signoz:forge
pnpm signoz:up
```

Then start TraceLLM:

```bash
pnpm infra:build
pnpm infra:up
```

TraceLLM exports to `http://host.docker.internal:4318` by default when running in Docker.

For SigNoz Cloud, set:

```bash
TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.<region>.signoz.cloud:443
TRACELLM_OTEL_EXPORTER_OTLP_HEADERS=signoz-ingestion-key=<your-ingestion-key>
```

The custom TraceLLM UI remains the product UI for sessions, API keys, and trace timelines.

## Real API Smoke Test

After creating an API key in the TraceLLM UI:

```bash
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_key"
$env:TRACELLM_REAL_API_URL="https://jsonplaceholder.typicode.com/posts/1"
pnpm example:real-api
```

You should see the trace in the TraceLLM UI immediately. If OTLP is configured, the same activity is exported to SigNoZ.

## Troubleshooting

If `pnpm infra:up` fails with a Docker build error, verify the server image independently:

```bash
pnpm infra:build
```

If `pnpm infra:up` fails with a port conflict, another SigNoz stack is already using one of these ports:

- `4319`

Check running containers:

```bash
docker ps
```

When running the backend locally with `pnpm dev:server` or `pnpm start:server`, port `4319` is already in use, so the Docker `tracellm-server` service cannot bind that same port.

## Production

For the first `tracellm.in` VPS deployment, use:

```bash
cp infra/production/server.env.example infra/production/server.env
cp infra/production/caddy.env.example infra/production/caddy.env
pnpm prod:up
```

Read the full guide in `docs/operations/vps-deployment.md`.
