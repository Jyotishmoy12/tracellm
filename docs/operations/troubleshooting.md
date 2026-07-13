# Troubleshooting

## TraceLLM UI Shows No Traces

Check:

1. The hosted API is reachable:

   ```text
   https://api.tracellm.in/health
   ```

2. SDK environment is set:

   ```bash
   TRACELLM_ENDPOINT=https://api.tracellm.in
   TRACELLM_API_KEY=trllm_...
   ```

3. API key belongs to the account/project shown in the UI.

4. Project config has tracing enabled.

5. Sampling rate is above `0`.

## API Key Fails

Create a new API key in the UI and copy it immediately. Full secrets are only shown once.

Then rerun:

```bash
TRACELLM_API_KEY=trllm_new_key
```

## Provider Example Fails

Check the provider key:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk_...
```

For Anthropic:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

For Gemini:

```bash
GEMINI_API_KEY=...
```

## External Export Does Not Show In SigNoz

Check the destination in **Exports**:

- destination is enabled
- endpoint is the OTLP HTTP base URL
- required headers are present
- **Send test trace** returns `ok`
- export config allows the span kinds and fields you expect

A failed external export does not block TraceLLM ingestion. Your traces should still appear in the TraceLLM dashboard.
