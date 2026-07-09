# Full Local Setup

This guide runs the full local developer stack:

- TraceLLM backend
- TraceLLM web UI
- official local SigNoz UI stack
- real provider example app

## 1. Install Dependencies

```powershell
cd C:\dev\tracellm
pnpm install
```

## 2. Generate SigNoz Stack

The repo includes a local Windows `foundryctl` binary under:

```text
tools/foundryctl/foundry_windows_amd64/bin/foundryctl.exe
```

Generate the official SigNoz Docker Compose stack:

```powershell
pnpm signoz:forge
```

This creates:

```text
infra/signoz/pours/deployment/compose.yaml
```

## 3. Start SigNoz

```powershell
pnpm signoz:up
```

Open:

```text
http://localhost:8080
```

On first use, create the initial SigNoz admin account. This is separate from your TraceLLM account.

## 4. Start TraceLLM Backend

```powershell
pnpm infra:build
pnpm infra:up
```

TraceLLM Docker exports OTLP to:

```text
http://host.docker.internal:4318
```

This reaches SigNoz's local OTLP HTTP collector on the host.

## 5. Start TraceLLM Web

```powershell
pnpm dev:web
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## 6. Create TraceLLM Account And API Key

In TraceLLM UI:

1. Register.
2. Create or copy an API key.
3. Configure capture settings as needed.

## 7. Run Real Provider Test

```powershell
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_key"
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_openai_key"
pnpm example:user-app
```

## 8. Verify In Both UIs

TraceLLM:

- look for `Customer support answer workflow`
- inspect timeline, spans, events, usage, and captured fields

SigNoz:

- open `http://localhost:8080`
- go to Services or Traces
- look for `tracellm-server`

## Stop Services

TraceLLM:

```powershell
pnpm infra:down
```

SigNoz:

```powershell
pnpm signoz:down
```
