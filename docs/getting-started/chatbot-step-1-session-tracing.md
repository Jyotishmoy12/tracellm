# Chatbot Step 1: Session Tracing

This guide tests the first TraceLLM property inside a real chatbot application.

The chatbot still calls the selected LLM provider directly. TraceLLM only observes the request and stores a session plus one LLM span.

For the reusable SDK pattern that users should copy into their own apps, read the [Node SDK Guide](../sdk/node.md).

## What This Step Adds

When `TRACELLM_ENABLED=true`, every chatbot request creates:

- a session named `Chatbot request`
- an LLM span named `<provider>.chat.complete`
- attributes for provider, model, app, message count, and latency
- token usage when the provider response includes usage
- structured errors if the provider call fails

Prompt and output content are passed to the SDK, but the backend stores them only when project config allows content capture.

## Run The Chatbot

Start the TraceLLM backend first.

```powershell
cd C:\dev\tracellm
pnpm.cmd dev:server
```

Start the web UI in another terminal.

```powershell
cd C:\dev\tracellm
pnpm.cmd dev:web
```

Create or log in to an account, then copy the project API key from the TraceLLM UI.

Start the chatbot with one provider key and the TraceLLM key.

```powershell
cd C:\dev\tracellm
$env:CHATBOT_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_key"
$env:TRACELLM_ENABLED="true"
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_project_key"
$env:TRACELLM_SERVICE_NAME="tracellm-chatbot"
pnpm.cmd chatbot:start
```

Open:

```text
http://localhost:4320
```

## What To Expect In The Chatbot

The left sidebar should show:

- provider configured
- TraceLLM enabled
- TraceLLM key configured
- endpoint `http://localhost:4319`

Send one chat message. The assistant should answer normally.

## What To Expect In TraceLLM UI

Open the TraceLLM web UI and refresh the session list.

You should see a new session:

```text
Chatbot request
```

The session timeline should include one LLM span:

```text
openai.chat.complete
```

For Anthropic or Gemini, the span name changes to:

```text
anthropic.chat.complete
gemini.chat.complete
```

The detail view should show provider, model, latency, and token usage when available.

## What To Expect In SigNoz

If SigNoz is running and the TraceLLM backend is exporting OTLP traces, this same request should appear as an exported trace.

TraceLLM is the source of truth for product-level LLM observability. SigNoz is the infrastructure observability view for traces exported from the backend.

## Configuration

Use project config in the TraceLLM UI for the normal behavior:

- `Tracing enabled`: controls whether SDK calls create records.
- `Capture prompt/output content`: controls whether prompt and answer text are stored.
- `Capture inputs`: stores request input fields.
- `Capture outputs`: stores response output fields.
- `Token usage`: stores token counts from the provider response.
- `Errors`: stores provider failures as structured error records.
- `Sampling rate`: decides what percentage of requests become traces.

Optional local overrides are available for testing:

```powershell
$env:TRACELLM_CAPTURE_CONTENT="false"
$env:TRACELLM_CAPTURE_INPUTS="false"
$env:TRACELLM_CAPTURE_OUTPUTS="false"
$env:TRACELLM_SAMPLING_RATE="1"
```

Prefer UI project config for real users. Local overrides are mainly for developer experiments.

## Disable This Step

To return to the clean chatbot baseline:

```powershell
$env:TRACELLM_ENABLED="false"
pnpm.cmd chatbot:start
```

No TraceLLM sessions or spans should be created while tracing is disabled.

## Next Step: Lifecycle Events

After session tracing works, enable lifecycle events:

```powershell
$env:TRACELLM_RECORD_EVENTS="true"
pnpm.cmd chatbot:start
```

Send another chat message.

The TraceLLM timeline should still show the session and LLM span, plus two event records:

```text
provider.request.started
provider.response.received
```

In SigNoz, these appear under the selected span's Events tab when the backend exports them.

## Next Step: Content Capture

The chatbot already sends input and output fields to the SDK:

- session input: latest user message
- session output: assistant answer
- span input: latest user message
- span output: assistant answer

TraceLLM stores those fields only when project config allows content capture.

In the TraceLLM UI, enable one of:

- `Capture prompt/output content`
- `Capture inputs`
- `Capture outputs`

Then refresh the chatbot. The sidebar should show:

```text
Content capture: enabled
```

Send a new message and open the resulting session/span detail in TraceLLM. You should see prompt/output fields according to the enabled setting.

SigNoz may receive selected content fields as span attributes only if the backend mapper exports them. Treat TraceLLM UI as the source of truth for content capture.

## Next Step: Redaction

After content capture is visible, test redaction.

In the TraceLLM UI, keep these enabled:

- `Redact emails`
- `Redact API keys`

Refresh the chatbot. The sidebar should show:

```text
Redact emails: enabled
Redact API keys: enabled
```

Send a message like:

```text
Please summarize this contact: jane@example.com. My temporary key is sk_test_123456789.
```

Open the new TraceLLM session. Captured input/output should contain placeholders:

```text
[redacted-email]
[redacted-key]
```

Redaction is applied before TraceLLM stores captured content. It does not alter the prompt sent to the LLM provider by the chatbot.

## Next Step: Error Capture

After redaction works, test provider failure capture.

In the TraceLLM UI, keep `Errors` enabled.

Restart the chatbot with simulated provider errors:

```powershell
$env:CHATBOT_SIMULATE_PROVIDER_ERROR="true"
pnpm.cmd chatbot:start
```

The chatbot sidebar should show:

```text
Error simulation: enabled
Error capture: enabled
```

Send any message.

Expected result in TraceLLM:

- session status becomes `error`
- LLM span status becomes `error`
- timeline includes structured error records
- error attributes include provider and model

Expected result in SigNoz:

- the exported span should show an error status or exception event, depending on the backend OTel mapper.

Turn simulation off after testing:

```powershell
$env:CHATBOT_SIMULATE_PROVIDER_ERROR="false"
```

## Next Step: Sampling

Sampling controls how often SDK calls create TraceLLM records.

In the TraceLLM UI, use the `Sampling rate` control:

- `100%`: every request should create a session.
- `0%`: no request should create a session.
- `50%`: approximately half of requests should create sessions over many requests.

Refresh the chatbot. The sidebar should show the effective sampling rate:

```text
Sampling rate: 100%
```

For faster local testing, start the chatbot with a shorter SDK config refresh interval:

```powershell
$env:TRACELLM_CONFIG_REFRESH_MS="1000"
pnpm.cmd chatbot:start
```

Then change sampling in the TraceLLM UI and wait about one second before sending another request.

Sampling affects new requests only. It does not remove old traces.

## Next Step: Token Usage

Token usage controls whether provider token counts are stored.

In the TraceLLM UI, keep `Token usage` enabled, then send a real provider-backed chat request.

Expected result in TraceLLM:

- session summary shows total tokens
- the LLM span shows input, output, and total token counts
- timeline span still shows duration/status/attributes

Then turn `Token usage` off, save config, wait for SDK config refresh, and send another request.

Expected result:

- session and span still appear
- usage breakdown is absent
- total tokens no longer increase for that request

Provider APIs may differ in token reporting. If a provider does not return usage, TraceLLM stores zero or no token counts for that call.

## Next Step: Metadata

Metadata controls whether attribute objects are stored.

The chatbot sends attributes such as:

- provider
- model
- message count
- latency
- total tokens

In the TraceLLM UI, turn `Metadata` off and save config.

Send a new chat message.

Expected result:

- session and span still exist
- JSON attribute blocks show empty objects
- input/output capture still follows content settings
- token usage still follows token usage settings

Turn `Metadata` back on to restore attributes.

## Next Step: Ignored Span Kinds

Ignored span kinds let a project skip whole categories of spans.

In the TraceLLM UI, add `llm` under ignored span kinds and save config.

Send a new chat message.

Expected result:

- session still appears
- LLM span such as `openai.chat.complete` is skipped
- span lifecycle events are skipped because they are attached to the ignored span
- session-level output/status still follows normal session behavior

Remove `llm` from ignored span kinds to restore LLM spans.
