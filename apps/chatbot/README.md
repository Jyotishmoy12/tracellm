# Chatbot Full-Stack Test App

This app is the baseline integration target for TraceLLM testing.

It is intentionally a normal full-stack AI chatbot first:

- Express API
- React + Vite frontend
- real OpenAI, Anthropic, or Gemini provider call
- `.env` based configuration
- optional TraceLLM SDK integration, controlled only by `.env`

TraceLLM starts disabled so the provider chatbot can be tested by itself.

## Configure

Copy the example env file:

```powershell
Copy-Item apps/chatbot/.env.example apps/chatbot/.env
```

Edit:

```text
apps/chatbot/.env
```

Choose a provider and set that provider key:

```text
CHATBOT_PROVIDER=openai
OPENAI_API_KEY=sk_your_key
OPENAI_MODEL=gpt-4.1-mini
```

or:

```text
CHATBOT_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your_key
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

or:

```text
CHATBOT_PROVIDER=gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-1.5-flash
```

To enable the first TraceLLM integration, add your TraceLLM project key in the same file:

```text
TRACELLM_ENABLED=true
TRACELLM_ENDPOINT=https://api.tracellm.in
TRACELLM_API_KEY=trllm_your_project_key
TRACELLM_SERVICE_NAME=tracellm-chatbot
TRACELLM_CAPTURE_CONTENT=false
TRACELLM_CONFIG_REFRESH_MS=30000
```

With this first integration enabled, each chat request creates one TraceLLM session and one `llm` span around the real provider call.

## Run

From the repo root:

```powershell
pnpm --filter @tracellm/chatbot dev
```

Open:

```text
http://localhost:4321
```

The Express API runs on:

```text
http://localhost:4320
```

## Test Modes

The UI includes modes that will later map to TraceLLM span kinds:

- `Standard`: normal provider chat
- `Workflow`: workflow wrapper step
- `Tool`: synthetic tool step plus LLM call
- `Retrieval`: synthetic retrieval step plus LLM call
- `Agent`: synthetic agent, tool, retrieval, and LLM steps
- `Custom`: synthetic custom preprocessing step plus LLM call

For now these modes appear in the app diagnostics panel. The first TraceLLM integration records only the provider `llm` span; workflow, tool, retrieval, agent, and custom spans will be added one at a time next.

## Next TraceLLM Test Order

After this baseline is confirmed:

1. session and LLM span
2. lifecycle events
3. prompt/output content capture
4. token usage
5. metadata
6. error capture
7. sampling
8. ignored span kinds
9. SigNoz/external exports
