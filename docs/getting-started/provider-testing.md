# Testing With Real LLM Providers

TraceLLM is provider-agnostic. Users can call OpenAI, Anthropic Claude, Gemini, or any other provider. The SDK records normalized sessions, spans, events, errors, and usage.

Use your normal application or a small test route in your app. The important part is that TraceLLM wraps the real provider call, not a demo response.

## Common Variables

```bash
TRACELLM_ENDPOINT=https://api.tracellm.in
TRACELLM_API_KEY=trllm_your_key_from_the_ui
TRACELLM_SERVICE_NAME=my-ai-service
```

## OpenAI

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk_your_openai_key
OPENAI_MODEL=gpt-4.1-mini
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

```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your_key
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
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

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash
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

## What To Trace

A good provider test usually traces:

1. Start a session for one user request.
2. Start an `llm` span before calling the provider.
3. Record a `provider.request.started` event.
4. Call the real provider.
5. Record a `provider.response.received` event.
6. End the span with status, usage, and output.
7. End the session.

This lets you compare TraceLLM behavior across providers while keeping the same session/span model.
