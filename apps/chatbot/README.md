# Chatbot Test App

This is the chatbot app we use to test TraceLLM step by step.

By default, it does not send traces. Enable TraceLLM explicitly when you want to test each tracing property.

The first TraceLLM property is request-level session tracing with one LLM span per chat request.
The second property is optional lifecycle events inside that span.
The third property is prompt/output content capture controlled from TraceLLM project config.
The fourth property is redaction for captured emails and API-key-like values.
The fifth property is provider error capture.
The sixth property is sampling control from TraceLLM project config.
The seventh property is token usage capture.
The eighth property is metadata capture.
The ninth property is ignored span kinds.

## Run

```powershell
cd C:\dev\tracellm
$env:CHATBOT_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_key"
pnpm chatbot:start
```

Open:

```text
http://localhost:4320
```

## Providers

OpenAI:

```powershell
$env:CHATBOT_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_key"
$env:OPENAI_MODEL="gpt-4.1-mini"
```

Anthropic:

```powershell
$env:CHATBOT_PROVIDER="anthropic"
$env:ANTHROPIC_API_KEY="sk-ant-your_key"
$env:ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
```

Gemini:

```powershell
$env:CHATBOT_PROVIDER="gemini"
$env:GEMINI_API_KEY="your_key"
$env:GEMINI_MODEL="gemini-1.5-flash"
```

## Enable TraceLLM Step 1

Make sure the TraceLLM backend is running and copy an API key from the TraceLLM UI.

```powershell
$env:TRACELLM_ENABLED="true"
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_project_key"
$env:TRACELLM_SERVICE_NAME="tracellm-chatbot"
pnpm chatbot:start
```

Expected result:

- one session named `Chatbot request`
- one LLM span named `<provider>.chat.complete`
- provider/model/message count metadata
- latency and token usage when the provider returns usage
- no prompt/output content unless project config enables content capture

## Enable TraceLLM Step 2: Lifecycle Events

```powershell
$env:TRACELLM_RECORD_EVENTS="true"
pnpm chatbot:start
```

Expected result:

- the same session and LLM span from step 1
- an event named `provider.request.started`
- an event named `provider.response.received`
- event attributes for provider, model, latency, and token counts

## Enable TraceLLM Step 3: Content Capture

The chatbot always passes request input and assistant output to the SDK. The backend stores them only when your project config allows it.

In the TraceLLM UI, enable one of:

- Capture prompt/output content
- Capture inputs
- Capture outputs

Restart or refresh the chatbot and check the sidebar:

```text
Content capture: enabled
```

Send a new chat message. Expected result:

- session input/output can appear in TraceLLM
- span input/output can appear in TraceLLM
- redaction still applies before storage

Turn those settings off again when testing sensitive prompts.

## Enable TraceLLM Step 4: Redaction

In the TraceLLM UI, keep these enabled:

- Redact emails
- Redact API keys

The chatbot sidebar should show:

```text
Redact emails: enabled
Redact API keys: enabled
```

Send a message like:

```text
Please summarize this contact: jane@example.com. My temporary key is sk_test_123456789.
```

Expected result in TraceLLM:

```text
[redacted-email]
[redacted-key]
```

The provider still receives the original prompt. Redaction happens before TraceLLM stores captured content.

## Enable TraceLLM Step 5: Error Capture

In the TraceLLM UI, keep `Errors` enabled.

Run the chatbot with simulated provider errors:

```powershell
$env:CHATBOT_SIMULATE_PROVIDER_ERROR="true"
pnpm chatbot:start
```

Send any chat message.

Expected result:

- the chatbot returns an error message
- the TraceLLM session is marked `error`
- the LLM span is marked `error`
- error records appear in the timeline when project `Errors` capture is enabled

Turn the simulation off when done:

```powershell
$env:CHATBOT_SIMULATE_PROVIDER_ERROR="false"
```

## Enable TraceLLM Step 6: Sampling

Sampling controls what percentage of requests become traces.

In the TraceLLM UI, set `Sampling rate` to:

- `100%`: every request should create a session.
- `0%`: no request should create a session.
- `50%`: roughly half of requests should create sessions over time.

The chatbot sidebar shows the effective sampling rate.

The SDK refreshes project config every 30 seconds by default. For faster local testing:

```powershell
$env:TRACELLM_CONFIG_REFRESH_MS="1000"
pnpm chatbot:start
```

Expected result:

- at `100%`, every new chat request appears in TraceLLM
- at `0%`, new chat requests do not appear in TraceLLM
- existing traces are not deleted when sampling changes

## Enable TraceLLM Step 7: Token Usage

In the TraceLLM UI, keep `Token usage` enabled.

Send a real provider-backed chat request.

Expected result:

- the session summary shows total tokens
- the LLM span shows input, output, and total token counts
- SigNoz span attributes include token fields when the backend exports them

Now turn `Token usage` off and save config.

Send another chat request.

Expected result:

- the session and span still exist
- no token usage rows are stored for that request
- token counts disappear from the span usage breakdown

## Enable TraceLLM Step 8: Metadata

Metadata controls whether attributes are stored.

In the TraceLLM UI, turn `Metadata` off and save config.

Send a new chat message.

Expected result:

- session and span still exist
- attributes blocks are empty objects
- input/output and usage behavior follow their own toggles

Turn `Metadata` back on to restore provider/model/message count attributes.

## Enable TraceLLM Step 9: Ignored Span Kinds

Ignored span kinds skip selected categories of spans.

In the TraceLLM UI, add `llm` to ignored span kinds and save config.

Send a new chat message.

Expected result:

- the session still exists
- the `openai.chat.complete` / provider LLM span is skipped
- span events and span errors are skipped because the LLM span is no-op

Remove `llm` from ignored span kinds to restore LLM spans.
