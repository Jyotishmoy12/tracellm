# Troubleshooting

## TraceLLM UI Shows No Traces

Check:

1. Backend is running:

   ```text
   http://localhost:4319/health
   ```

2. SDK environment is set:

   ```powershell
   $env:TRACELLM_ENDPOINT="http://localhost:4319"
   $env:TRACELLM_API_KEY="trllm_..."
   ```

3. API key belongs to the account/project shown in the UI.

4. Project config has tracing enabled.

5. Sampling rate is above `0`.

## API Key Fails

Create a new API key in the UI and copy it immediately. Full secrets are only shown once.

Then rerun:

```powershell
$env:TRACELLM_API_KEY="trllm_new_key"
pnpm example:user-app
```

## Provider Example Fails

Check the provider key:

```powershell
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_..."
```

For Anthropic:

```powershell
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

For Gemini:

```powershell
$env:GEMINI_API_KEY="..."
```

## SigNoz Does Not Show Service

Check SigNoz is running:

```powershell
docker compose -f infra/signoz/pours/deployment/compose.yaml ps
```

Check TraceLLM health:

```text
http://localhost:4319/health
```

The health response should show:

```text
http://host.docker.internal:4318/v1/traces
```

Run the example again after SigNoz is running:

```powershell
pnpm example:user-app
```

## Port Conflicts

Common ports:

| Port | Used By |
| --- | --- |
| `4319` | TraceLLM backend |
| `5173` | Vite web dev server |
| `8080` | SigNoz UI |
| `4318` | OTLP HTTP |
| `4317` | OTLP gRPC |

Stop TraceLLM:

```powershell
pnpm infra:down
```

Stop SigNoz:

```powershell
pnpm signoz:down
```

## Docker Data Reset

TraceLLM data volume:

```powershell
pnpm infra:down
docker volume rm infra_tracellm-data
```

SigNoz data volumes are managed by the generated SigNoz compose stack.

Use caution before deleting them.
