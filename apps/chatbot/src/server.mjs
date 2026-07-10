import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { TraceLLM } from "@use-tracellm/sdk-node";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.CHATBOT_PORT ?? "4320");

const provider = readProvider(process.env.CHATBOT_PROVIDER ?? "openai");
const model = readModel(provider);
const simulateProviderError = readBoolean(process.env.CHATBOT_SIMULATE_PROVIDER_ERROR, false);
const traceLLMEnabled = readBoolean(process.env.TRACELLM_ENABLED, false);
const traceLLMRecordEvents = readBoolean(process.env.TRACELLM_RECORD_EVENTS, false);
const traceLLMEndpoint = process.env.TRACELLM_ENDPOINT ?? "http://localhost:4319";
const traceLLMServiceName = process.env.TRACELLM_SERVICE_NAME ?? "tracellm-chatbot";
const tracellm = traceLLMEnabled
  ? new TraceLLM({
      endpoint: traceLLMEndpoint,
      apiKey: process.env.TRACELLM_API_KEY,
      serviceName: traceLLMServiceName,
      configRefreshMs: readNumber(process.env.TRACELLM_CONFIG_REFRESH_MS, 30_000),
      tracing: readLocalTracingOverrides()
    })
  : undefined;

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/api/config") {
      const tracingConfig = await readEffectiveTracingConfig();
      sendJson(response, 200, {
        provider,
        model,
        hasProviderKey: hasProviderKey(provider),
        simulateProviderError,
        traceLLM: {
          enabled: traceLLMEnabled,
          recordEvents: traceLLMRecordEvents,
          endpoint: traceLLMEndpoint,
          serviceName: traceLLMServiceName,
          hasApiKey: Boolean(process.env.TRACELLM_API_KEY),
          tracingConfig
        }
      });
      return;
    }

    if (request.method === "POST" && request.url === "/api/chat") {
      const body = await readJsonBody(request);
      const messages = validateMessages(body.messages);
      const answer = await completeChatWithOptionalTrace(messages);
      sendJson(response, 200, answer);
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error"
    });
  }
});

server.listen(port, () => {
  console.log(`Chatbot running at http://localhost:${port}`);
  console.log(`Provider: ${provider}`);
  console.log(`Model: ${model}`);
  console.log(`Simulated provider error: ${simulateProviderError ? "enabled" : "disabled"}`);
  console.log(`TraceLLM: ${traceLLMEnabled ? `enabled (${traceLLMEndpoint})` : "disabled"}`);
  console.log(`TraceLLM events: ${traceLLMRecordEvents ? "enabled" : "disabled"}`);
});

async function serveStatic(request, response) {
  const url = new URL(request.url ?? "/", `http://localhost:${port}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-store"
    });
    response.end(content);
  } catch {
    const index = await readFile(join(publicDir, "index.html"));
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end(index);
  }
}

function contentType(filePath) {
  const extension = extname(filePath);
  if (extension === ".css") {
    return "text/css; charset=utf-8";
  }
  if (extension === ".js") {
    return "application/javascript; charset=utf-8";
  }
  if (extension === ".html") {
    return "text/html; charset=utf-8";
  }
  return "application/octet-stream";
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text) {
  response.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(text);
}

async function readJsonBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 128_000) {
      throw new Error("Request body too large");
    }
  }

  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function validateMessages(value) {
  if (!Array.isArray(value)) {
    throw new Error("messages must be an array");
  }

  return value.map((message) => {
    if (!message || typeof message !== "object") {
      throw new Error("Each message must be an object");
    }
    if (message.role !== "user" && message.role !== "assistant") {
      throw new Error("Message role must be user or assistant");
    }
    if (typeof message.content !== "string" || message.content.trim().length === 0) {
      throw new Error("Message content is required");
    }
    return {
      role: message.role,
      content: message.content.trim()
    };
  });
}

function readProvider(value) {
  if (value === "openai" || value === "anthropic" || value === "gemini") {
    return value;
  }
  throw new Error("CHATBOT_PROVIDER must be one of: openai, anthropic, gemini");
}

function readModel(selectedProvider) {
  if (selectedProvider === "openai") {
    return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  }
  if (selectedProvider === "anthropic") {
    return process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";
  }
  return process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
}

function hasProviderKey(selectedProvider) {
  if (selectedProvider === "openai") {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  if (selectedProvider === "anthropic") {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }
  return Boolean(process.env.GEMINI_API_KEY);
}

async function completeChat(messages) {
  if (simulateProviderError) {
    throw new Error("Simulated provider failure for TraceLLM error capture testing");
  }

  if (!hasProviderKey(provider)) {
    throw new Error(`Missing API key for provider ${provider}`);
  }

  if (provider === "openai") {
    return completeWithOpenAI(messages);
  }
  if (provider === "anthropic") {
    return completeWithAnthropic(messages);
  }
  return completeWithGemini(messages);
}

async function completeChatWithOptionalTrace(messages) {
  if (!tracellm) {
    return completeChat(messages);
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const session = await tracellm.startSession({
    name: "Chatbot request",
    userId: process.env.CHATBOT_USER_ID,
    attributes: {
      app: "provider-chatbot",
      property: traceLLMRecordEvents ? "session-span-and-events" : "session-and-llm-span",
      provider,
      model,
      messageCount: messages.length
    },
    input: latestUserMessage?.content
  });

  let span;
  const startedAt = Date.now();

  try {
    span = await session.startSpan({
      name: `${provider}.chat.complete`,
      kind: "llm",
      attributes: {
        provider,
        model,
        messageCount: messages.length
      },
      input: latestUserMessage?.content
    });

    if (traceLLMRecordEvents) {
      await span.recordEvent({
        name: "provider.request.started",
        attributes: {
          provider,
          model,
          messageCount: messages.length
        }
      });
    }

    const answer = await completeChat(messages);
    const latencyMs = Date.now() - startedAt;

    if (traceLLMRecordEvents) {
      await span.recordEvent({
        name: "provider.response.received",
        attributes: {
          provider,
          model,
          latencyMs,
          inputTokens: answer.usage.inputTokens ?? 0,
          outputTokens: answer.usage.outputTokens ?? 0,
          totalTokens: answer.usage.totalTokens ?? 0
        }
      });
    }

    await span.end({
      status: "ok",
      usage: answer.usage,
      attributes: {
        provider,
        model,
        latencyMs
      },
      output: answer.message.content
    });
    await session.end({
      status: "ok",
      attributes: {
        provider,
        model,
        latencyMs,
        totalTokens: answer.usage.totalTokens ?? 0
      },
      output: answer.message.content
    });

    return {
      ...answer,
      traceLLM: {
        sessionId: session.id,
        traceId: session.traceId,
        spanId: span.id
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chat error";
    const type = error instanceof Error ? error.name : "Error";
    const stack = error instanceof Error ? error.stack : undefined;

    if (span) {
      await span.recordError({
        name: "provider.request.failed",
        message,
        type,
        stack,
        attributes: {
          provider,
          model
        }
      });
      await span.end({ status: "error" });
    }

    await session.recordError({
      name: "chatbot.request.failed",
      message,
      type,
      stack,
      attributes: {
        provider,
        model
      }
    });
    await session.end({ status: "error" });
    throw error;
  }
}

async function readEffectiveTracingConfig() {
  if (!tracellm) {
    return undefined;
  }

  try {
    const config = await tracellm.getTracingConfig();
    return {
      enabled: config.enabled,
      captureContent: config.captureContent,
      captureInputs: config.captureInputs,
      captureOutputs: config.captureOutputs,
      captureTokenUsage: config.captureTokenUsage,
      captureErrors: config.captureErrors,
      captureMetadata: config.captureMetadata,
      samplingRate: config.samplingRate,
      ignoredSpanKinds: config.ignoredSpanKinds,
      redaction: config.redaction
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to read TraceLLM project config"
    };
  }
}

async function completeWithOpenAI(messages) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    })
  });

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`OpenAI failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const text =
    data?.output_text ??
    data?.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n");

  return normalizeProviderResult({
    provider: "openai",
    model: data?.model ?? model,
    text,
    usage: {
      inputTokens: data?.usage?.input_tokens ?? 0,
      outputTokens: data?.usage?.output_tokens ?? 0,
      totalTokens: data?.usage?.total_tokens ?? 0
    }
  });
}

async function completeWithAnthropic(messages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    })
  });

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`Anthropic failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const text = data?.content
    ?.map((content) => content.text)
    .filter(Boolean)
    .join("\n");
  const inputTokens = data?.usage?.input_tokens ?? 0;
  const outputTokens = data?.usage?.output_tokens ?? 0;

  return normalizeProviderResult({
    provider: "anthropic",
    model: data?.model ?? model,
    text,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens
    }
  });
}

async function completeWithGemini(messages) {
  const prompt = messages.map((message) => `${message.role}: ${message.content}`).join("\n\n");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      process.env.GEMINI_API_KEY ?? ""
    )}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(`Gemini failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const text = data?.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n");

  return normalizeProviderResult({
    provider: "gemini",
    model,
    text,
    usage: {
      inputTokens: data?.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data?.usageMetadata?.candidatesTokenCount ?? 0,
      totalTokens: data?.usageMetadata?.totalTokenCount ?? 0
    }
  });
}

function normalizeProviderResult(result) {
  if (!result.text || typeof result.text !== "string") {
    throw new Error(`${result.provider} response did not include text output`);
  }

  return {
    provider: result.provider,
    model: result.model,
    message: {
      role: "assistant",
      content: result.text.trim()
    },
    usage: result.usage
  };
}

function readBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  return value === "true" || value === "1" || value.toLowerCase() === "yes";
}

function readNumber(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function readLocalTracingOverrides() {
  const overrides = {};
  if (process.env.TRACELLM_CAPTURE_CONTENT !== undefined) {
    overrides.captureContent = readBoolean(process.env.TRACELLM_CAPTURE_CONTENT, false);
  }
  if (process.env.TRACELLM_CAPTURE_INPUTS !== undefined) {
    overrides.captureInputs = readBoolean(process.env.TRACELLM_CAPTURE_INPUTS, false);
  }
  if (process.env.TRACELLM_CAPTURE_OUTPUTS !== undefined) {
    overrides.captureOutputs = readBoolean(process.env.TRACELLM_CAPTURE_OUTPUTS, false);
  }
  if (process.env.TRACELLM_SAMPLING_RATE !== undefined) {
    overrides.samplingRate = Number(process.env.TRACELLM_SAMPLING_RATE);
  }
  return overrides;
}
