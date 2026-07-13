import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const spanKindSchema = z
  .enum(["llm", "tool", "retrieval", "agent", "workflow", "custom"])
  .openapi("SpanKind");

export const traceStatusSchema = z
  .enum(["ok", "error", "cancelled", "running"])
  .openapi("TraceStatus");

export const attributesSchema = z.record(z.unknown()).default({}).openapi("Attributes");

export const usageSchema = z
  .object({
    inputTokens: z.number().int().nonnegative().optional(),
    outputTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
    estimatedCostUsd: z.number().nonnegative().optional()
  })
  .partial()
  .openapi("Usage");

export const tracingConfigSchema = z
  .object({
    enabled: z.boolean().default(true),
    captureContent: z.boolean().default(false),
    captureInputs: z.boolean().default(false),
    captureOutputs: z.boolean().default(false),
    captureToolCalls: z.boolean().default(true),
    captureRetrieval: z.boolean().default(true),
    captureErrors: z.boolean().default(true),
    captureTokenUsage: z.boolean().default(true),
    captureLatency: z.boolean().default(true),
    captureMetadata: z.boolean().default(true),
    samplingRate: z.number().min(0).max(1).default(1),
    redaction: z
      .object({
        enabled: z.boolean().default(true),
        emails: z.boolean().default(true),
        apiKeys: z.boolean().default(true)
      })
      .default({
        enabled: true,
        emails: true,
        apiKeys: true
      }),
    ignoredSpanKinds: z.array(spanKindSchema).default([]),
    ignoredTools: z.array(z.string()).default([])
  })
  .openapi("TracingConfig");

export const updateTracingConfigSchema = tracingConfigSchema.partial().openapi("UpdateTracingConfigRequest");

export const createApiKeySchema = z
  .object({
    name: z.string().min(1).max(120).default("SDK key")
  })
  .openapi("CreateApiKeyRequest");

export const exportDestinationHeadersSchema = z
  .record(z.string().min(1).max(200), z.string().max(2000))
  .default({})
  .openapi("ExportDestinationHeaders");

export const exportDestinationConfigSchema = z
  .object({
    exportSpans: z.boolean().default(true),
    exportEvents: z.boolean().default(true),
    exportErrors: z.boolean().default(true),
    exportTokenUsage: z.boolean().default(true),
    exportMetadata: z.boolean().default(true),
    exportContent: z.boolean().default(false),
    spanKinds: z.array(spanKindSchema).default(["llm", "tool", "retrieval", "agent", "workflow", "custom"])
  })
  .openapi("ExportDestinationConfig");

export const createExportDestinationSchema = z
  .object({
    name: z.string().min(1).max(120),
    type: z.literal("otlp_http").default("otlp_http"),
    enabled: z.boolean().default(true),
    endpoint: z.string().url(),
    headers: exportDestinationHeadersSchema.optional(),
    config: exportDestinationConfigSchema.optional()
  })
  .openapi("CreateExportDestinationRequest");

export const updateExportDestinationSchema = createExportDestinationSchema
  .partial()
  .openapi("UpdateExportDestinationRequest");

export const registerSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(12).max(200),
    name: z.string().min(1).max(120).optional(),
    workspaceName: z.string().min(1).max(120).optional()
  })
  .openapi("RegisterRequest");

export const loginSchema = z
  .object({
    email: z.string().email().max(254),
    password: z.string().min(1).max(200)
  })
  .openapi("LoginRequest");

export const createSessionSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    userId: z.string().min(1).max(200).optional(),
    traceId: z.string().min(1).max(128).optional(),
    serviceName: z.string().min(1).max(200).optional(),
    attributes: attributesSchema.optional(),
    input: z.string().optional(),
    output: z.string().optional()
  })
  .openapi("CreateSessionRequest");

export const endSessionSchema = z
  .object({
    status: traceStatusSchema.exclude(["running"]).default("ok"),
    output: z.string().optional(),
    attributes: attributesSchema.optional()
  })
  .openapi("EndSessionRequest");

export const createSpanSchema = z
  .object({
    sessionId: z.string().min(1).max(128),
    traceId: z.string().min(1).max(128).optional(),
    parentSpanId: z.string().min(1).max(128).optional(),
    name: z.string().min(1).max(200),
    kind: spanKindSchema.default("custom"),
    attributes: attributesSchema.optional(),
    usage: usageSchema.optional(),
    input: z.string().optional(),
    output: z.string().optional()
  })
  .openapi("CreateSpanRequest");

export const endSpanSchema = z
  .object({
    status: traceStatusSchema.exclude(["running"]).default("ok"),
    attributes: attributesSchema.optional(),
    usage: usageSchema.optional(),
    output: z.string().optional()
  })
  .openapi("EndSpanRequest");

export const createEventSchema = z
  .object({
    sessionId: z.string().min(1).max(128),
    spanId: z.string().min(1).max(128).optional(),
    name: z.string().min(1).max(200),
    attributes: attributesSchema.optional()
  })
  .openapi("CreateEventRequest");

export const createErrorSchema = z
  .object({
    sessionId: z.string().min(1).max(128),
    spanId: z.string().min(1).max(128).optional(),
    name: z.string().min(1).max(200).default("exception"),
    message: z.string().min(1),
    type: z.string().min(1).max(200).optional(),
    stack: z.string().optional(),
    attributes: attributesSchema.optional()
  })
  .openapi("CreateErrorRequest");

export const idParamSchema = z.object({
  sessionId: z.string().min(1).optional(),
  spanId: z.string().min(1).optional()
});

export type CreateSessionRequest = z.infer<typeof createSessionSchema>;
export type EndSessionRequest = z.infer<typeof endSessionSchema>;
export type CreateSpanRequest = z.infer<typeof createSpanSchema>;
export type EndSpanRequest = z.infer<typeof endSpanSchema>;
export type CreateEventRequest = z.infer<typeof createEventSchema>;
export type CreateErrorRequest = z.infer<typeof createErrorSchema>;
export type TracingConfig = z.infer<typeof tracingConfigSchema>;
export type UpdateTracingConfigRequest = z.infer<typeof updateTracingConfigSchema>;
export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;
export type ExportDestinationConfig = z.infer<typeof exportDestinationConfigSchema>;
export type CreateExportDestinationRequest = z.infer<typeof createExportDestinationSchema>;
export type UpdateExportDestinationRequest = z.infer<typeof updateExportDestinationSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
