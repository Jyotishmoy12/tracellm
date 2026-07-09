# Testing With Real LLM Providers

TraceLLM is provider-agnostic. Users can call OpenAI, Anthropic Claude, Gemini, or any other provider. The SDK records normalized sessions, spans, events, errors, and usage.

The local `examples/user-app` supports three real providers.

## Common Variables

```powershell
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_key_from_the_ui"
```

## OpenAI

```powershell
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_openai_key"
$env:OPENAI_MODEL="gpt-4.1-mini"
pnpm example:user-app
```

The app calls:

```text
https://api.openai.com/v1/responses
```

TraceLLM records:

- provider: `openai`
- model
- response id
- output text, if content capture allows it
- token usage, if returned

## Anthropic Claude

```powershell
$env:LLM_PROVIDER="anthropic"
$env:ANTHROPIC_API_KEY="sk-ant-your_key"
$env:ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
pnpm example:user-app
```

The app calls:

```text
https://api.anthropic.com/v1/messages
```

TraceLLM records:

- provider: `anthropic`
- model
- response id
- output text, if content capture allows it
- input and output tokens

## Gemini

```powershell
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="your_gemini_key"
$env:GEMINI_MODEL="gemini-1.5-flash"
pnpm example:user-app
```

The app calls:

```text
https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent
```

TraceLLM records:

- provider: `gemini`
- model
- output text, if content capture allows it
- prompt, candidate, and total token counts when returned

## What The Example Does

The example models a customer support assistant:

1. Fetch customer profile.
2. Fetch recent customer activity.
3. Build a support prompt.
4. Call the selected LLM provider.
5. Record usage and output.
6. End the session.

This is not a mock trace. The LLM call is real when the provider API key is configured.
