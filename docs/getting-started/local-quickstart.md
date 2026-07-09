# Local Quickstart

Use this guide to run TraceLLM locally and send a real LLM trace from the example user application.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop
- One real LLM provider key:
  - OpenAI, or
  - Anthropic Claude, or
  - Gemini

## Install Dependencies

Run from the project root:

```powershell
cd C:\dev\tracellm
pnpm install
```

## Start TraceLLM Backend

```powershell
pnpm infra:build
pnpm infra:up
```

Backend health:

```text
http://localhost:4319/health
```

Swagger:

```text
http://localhost:4319/api-docs
```

## Start Web UI

In another terminal:

```powershell
pnpm dev:web
```

Open the web URL printed by Vite. It is usually:

```text
http://localhost:5173
```

## Create Account

In the TraceLLM UI:

1. Register a new account.
2. Open Project Config.
3. Create or copy an API key.
4. Save the API key for the example app.

## Run Real LLM Example

Set common TraceLLM variables:

```powershell
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_key_from_the_ui"
```

Choose a provider.

=== "OpenAI"

    ```powershell
    $env:LLM_PROVIDER="openai"
    $env:OPENAI_API_KEY="sk_your_openai_key"
    $env:OPENAI_MODEL="gpt-4.1-mini"
    pnpm example:user-app
    ```

=== "Anthropic"

    ```powershell
    $env:LLM_PROVIDER="anthropic"
    $env:ANTHROPIC_API_KEY="sk-ant-your_key"
    $env:ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
    pnpm example:user-app
    ```

=== "Gemini"

    ```powershell
    $env:LLM_PROVIDER="gemini"
    $env:GEMINI_API_KEY="your_gemini_key"
    $env:GEMINI_MODEL="gemini-1.5-flash"
    pnpm example:user-app
    ```

## Confirm Success

Refresh the TraceLLM UI.

You should see:

```text
Customer support answer workflow
```

The timeline should include:

- `fetch.customer.profile`
- `fetch.customer.activity`
- provider LLM span such as `openai.chat.generate`
- events and token usage when provider metadata is available
