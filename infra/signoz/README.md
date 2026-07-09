# Local SigNoz UI

TraceLLM uses the official SigNoz self-hosted Docker path for the full local UI stack.

SigNoz now recommends Foundry for Docker Compose installs. It generates the complete stack, including SigNoz UI, query/backend service, migrations, collector, ClickHouse, ClickHouse Keeper, and Postgres.

## One-Time Setup

This repo installs `foundryctl` locally under:

```text
tools/foundryctl/foundry_windows_amd64/bin/foundryctl.exe
```

Verify it:

```powershell
cd C:\dev\tracellm
.\tools\foundryctl\foundry_windows_amd64\bin\foundryctl.exe version
```

Generate the compose stack:

```powershell
cd C:\dev\tracellm
pnpm signoz:forge
```

## Start SigNoz

```powershell
pnpm signoz:up
```

Open:

```text
http://localhost:8080
```

OTLP HTTP will be available at:

```text
http://localhost:4318
```

## Start TraceLLM

TraceLLM's Docker backend exports to the host SigNoz collector:

```text
TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT=http://host.docker.internal:4318
```

Run:

```powershell
pnpm infra:build
pnpm infra:up
```

Then run the real user app example and look for service `tracellm-server` in SigNoz.

## Stop

```powershell
pnpm signoz:down
```
