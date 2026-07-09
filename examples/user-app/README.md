# TraceLLM User App Example

This example behaves like a customer application using the TraceLLM SDK and a real LLM provider call.

It creates a support workflow trace, fetches real HTTP data, calls OpenAI, Anthropic Claude, or Gemini, records tool/retrieval/LLM spans, then sends the timeline to your local TraceLLM backend.

## Run

```powershell
cd C:\dev\tracellm
$env:TRACELLM_ENDPOINT="http://localhost:4319"
$env:TRACELLM_API_KEY="trllm_your_key_from_the_ui"
```

OpenAI:

```powershell
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_your_openai_key"
$env:OPENAI_MODEL="gpt-4.1-mini"
pnpm example:user-app
```

Anthropic Claude:

```powershell
$env:LLM_PROVIDER="anthropic"
$env:ANTHROPIC_API_KEY="sk-ant-your_key"
$env:ANTHROPIC_MODEL="claude-3-5-sonnet-latest"
pnpm example:user-app
```

Gemini:

```powershell
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="your_gemini_key"
$env:GEMINI_MODEL="gemini-1.5-flash"
pnpm example:user-app
```

Open the TraceLLM UI and refresh the session list. You should see `Customer support answer workflow`.

The LLM span should be named by provider, for example `openai.chat.generate`, `anthropic.chat.generate`, or `gemini.chat.generate`, and include real token usage when the provider returns usage metadata.
