import { TraceLLM, type TraceLLMSession, type TraceLLMSpan } from "@use-tracellm/sdk-node";
import { env, hasProviderKey, providerModel } from "../config/env.js";
import type { ChatRequest, ChatResponse } from "../dto/chat.dto.js";
import { createProvider } from "../providers/provider.factory.js";

type DiagnosticKind = ChatResponse["diagnostics"][number]["kind"];

interface DiagnosticStep {
  name: string;
  kind: DiagnosticKind;
  startedAt: number;
  metadata: Record<string, unknown>;
}

export class ChatService {
  private readonly provider = createProvider();
  private readonly tracer = env.TRACELLM_ENABLED
    ? new TraceLLM({
        endpoint: env.TRACELLM_ENDPOINT,
        ...(env.TRACELLM_API_KEY ? { apiKey: env.TRACELLM_API_KEY } : {}),
        serviceName: env.TRACELLM_SERVICE_NAME,
        captureContent: env.TRACELLM_CAPTURE_CONTENT,
        configRefreshMs: env.TRACELLM_CONFIG_REFRESH_MS
      })
    : undefined;

  getConfig() {
    return {
      provider: env.CHATBOT_PROVIDER,
      model: providerModel(),
      hasProviderKey: hasProviderKey(),
      simulateProviderError: env.CHATBOT_SIMULATE_PROVIDER_ERROR,
      traceLLM: {
        enabled: Boolean(this.tracer),
        endpoint: env.TRACELLM_ENDPOINT,
        hasApiKey: Boolean(env.TRACELLM_API_KEY),
        captureContent: env.TRACELLM_CAPTURE_CONTENT,
        note: this.tracer
          ? "TraceLLM records one session and one LLM span for each chat request."
          : "TraceLLM is installed but disabled. Set TRACELLM_ENABLED=true in apps/chatbot/.env."
      }
    };
  }

  async complete(request: ChatRequest): Promise<ChatResponse> {
    if (env.CHATBOT_SIMULATE_PROVIDER_ERROR) {
      throw new Error("Simulated provider failure");
    }

    if (!hasProviderKey()) {
      throw new Error(`Missing API key for provider ${env.CHATBOT_PROVIDER}`);
    }

    const diagnostics: ChatResponse["diagnostics"] = [];
    const startedAt = Date.now();
    let session: TraceLLMSession | undefined;
    let llmSpan: TraceLLMSpan | undefined;

    await this.runSyntheticStep("chat.workflow", "workflow", request.mode, diagnostics, {
      mode: request.mode,
      messageCount: request.messages.length
    });

    if (request.mode === "tool" || request.mode === "agent") {
      await this.runSyntheticStep("tool.intent-classifier", "tool", request.mode, diagnostics, {
        intent: this.classifyIntent(request.messages.at(-1)?.content ?? "")
      });
    }

    if (request.mode === "retrieval" || request.mode === "agent") {
      await this.runSyntheticStep("retrieval.local-documents", "retrieval", request.mode, diagnostics, {
        documents: ["pricing.md", "sdk.md", "observability.md"]
      });
    }

    if (request.mode === "agent") {
      await this.runSyntheticStep("agent.plan", "agent", request.mode, diagnostics, {
        plan: ["classify", "retrieve", "answer"]
      });
    }

    if (request.mode === "custom") {
      await this.runSyntheticStep("custom.prompt-normalizer", "custom", request.mode, diagnostics, {
        normalized: true
      });
    }

    const llmStep = this.startStep(`${env.CHATBOT_PROVIDER}.chat.complete`, "llm", {
      provider: env.CHATBOT_PROVIDER,
      model: providerModel()
    });
    try {
      session = await this.startTraceSession(request);
      llmSpan = await this.startTraceSpan(session, request);

      const completion = await this.provider.complete(request.messages);
      diagnostics.push(this.endStep(llmStep));

      await this.endTraceSpan(llmSpan, {
        status: "ok",
        output: completion.content,
        usage: completion.usage,
        attributes: {
          provider: completion.provider,
          model: completion.model,
          mode: request.mode
        }
      });
      await this.endTraceSession(session, {
        status: "ok",
        output: completion.content,
        attributes: {
          provider: completion.provider,
          model: completion.model,
          mode: request.mode,
          latencyMs: Date.now() - startedAt
        }
      });

      return {
        provider: completion.provider,
        model: completion.model,
        mode: request.mode,
        message: {
          role: "assistant",
          content: completion.content
        },
        usage: completion.usage,
        latencyMs: Date.now() - startedAt,
        diagnostics
      };
    } catch (error) {
      diagnostics.push(this.endStep(llmStep));
      await this.recordTraceError(error, session, llmSpan);
      throw error;
    }
  }

  private async runSyntheticStep(
    name: string,
    kind: DiagnosticKind,
    mode: string,
    diagnostics: ChatResponse["diagnostics"],
    metadata: Record<string, unknown>
  ): Promise<void> {
    const step = this.startStep(name, kind, { ...metadata, mode });
    await new Promise((resolve) => setTimeout(resolve, 20));
    diagnostics.push(this.endStep(step));
  }

  private startStep(name: string, kind: DiagnosticKind, metadata: Record<string, unknown>): DiagnosticStep {
    return {
      name,
      kind,
      startedAt: Date.now(),
      metadata
    };
  }

  private endStep(step: DiagnosticStep): ChatResponse["diagnostics"][number] {
    return {
      name: step.name,
      kind: step.kind,
      durationMs: Date.now() - step.startedAt,
      metadata: step.metadata
    };
  }

  private classifyIntent(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("price") || lower.includes("cost")) {
      return "pricing";
    }
    if (lower.includes("sdk") || lower.includes("install")) {
      return "integration";
    }
    return "general";
  }

  private async startTraceSession(request: ChatRequest): Promise<TraceLLMSession | undefined> {
    if (!this.tracer) {
      return undefined;
    }

    try {
      return await this.tracer.startSession({
        name: "Chatbot request",
        userId: env.CHATBOT_USER_ID,
        input: this.latestUserMessage(request),
        attributes: {
          app: "chatbot",
          mode: request.mode,
          provider: env.CHATBOT_PROVIDER,
          model: providerModel(),
          messageCount: request.messages.length
        }
      });
    } catch (error) {
      console.warn("TraceLLM session start failed", error);
      return undefined;
    }
  }

  private async startTraceSpan(session: TraceLLMSession | undefined, request: ChatRequest): Promise<TraceLLMSpan | undefined> {
    if (!session) {
      return undefined;
    }

    try {
      return await session.startSpan({
        name: `${env.CHATBOT_PROVIDER}.chat.complete`,
        kind: "llm",
        input: this.latestUserMessage(request),
        attributes: {
          provider: env.CHATBOT_PROVIDER,
          model: providerModel(),
          mode: request.mode
        }
      });
    } catch (error) {
      console.warn("TraceLLM span start failed", error);
      return undefined;
    }
  }

  private async endTraceSpan(
    span: TraceLLMSpan | undefined,
    input: Parameters<TraceLLMSpan["end"]>[0]
  ): Promise<void> {
    if (!span) {
      return;
    }

    try {
      await span.end(input);
    } catch (error) {
      console.warn("TraceLLM span end failed", error);
    }
  }

  private async endTraceSession(
    session: TraceLLMSession | undefined,
    input: Parameters<TraceLLMSession["end"]>[0]
  ): Promise<void> {
    if (!session) {
      return;
    }

    try {
      await session.end(input);
    } catch (error) {
      console.warn("TraceLLM session end failed", error);
    }
  }

  private async recordTraceError(
    error: unknown,
    session: TraceLLMSession | undefined,
    span: TraceLLMSpan | undefined
  ): Promise<void> {
    const message = error instanceof Error ? error.message : "Unknown chatbot failure";
    const stack = error instanceof Error ? error.stack : undefined;

    try {
      if (span) {
        await span.recordError({
          message,
          type: error instanceof Error ? error.name : "Error",
          ...(stack ? { stack } : {})
        });
        await span.end({ status: "error", attributes: { provider: env.CHATBOT_PROVIDER, model: providerModel() } });
      }

      if (session) {
        await session.recordError({
          message,
          type: error instanceof Error ? error.name : "Error",
          ...(stack ? { stack } : {})
        });
        await session.end({ status: "error", attributes: { provider: env.CHATBOT_PROVIDER, model: providerModel() } });
      }
    } catch (traceError) {
      console.warn("TraceLLM error recording failed", traceError);
    }
  }

  private latestUserMessage(request: ChatRequest): string | undefined {
    return [...request.messages].reverse().find((message) => message.role === "user")?.content;
  }
}
