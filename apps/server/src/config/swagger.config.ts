import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  createErrorSchema,
  createEventSchema,
  createExportDestinationSchema,
  createSessionSchema,
  createSpanSchema,
  endSessionSchema,
  endSpanSchema,
  loginSchema,
  registerSchema,
  updateExportDestinationSchema
} from "@use-tracellm/shared";
import { env } from "./env.config.js";

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const errorResponse = registry.register(
  "ErrorResponse",
  z.object({
    error: z.object({
      message: z.string(),
      details: z.unknown().optional(),
      requestId: z.string().optional()
    })
  })
);

const anyObject = z.record(z.unknown());

registry.register("CreateSessionRequest", createSessionSchema);
registry.register("EndSessionRequest", endSessionSchema);
registry.register("CreateSpanRequest", createSpanSchema);
registry.register("EndSpanRequest", endSpanSchema);
registry.register("CreateEventRequest", createEventSchema);
registry.register("CreateErrorRequest", createErrorSchema);
registry.register("RegisterRequest", registerSchema);
registry.register("LoginRequest", loginSchema);
registry.register("CreateExportDestinationRequest", createExportDestinationSchema);
registry.register("UpdateExportDestinationRequest", updateExportDestinationSchema);

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    200: {
      description: "Health status",
      content: { "application/json": { schema: anyObject } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/health/live",
  tags: ["Health"],
  responses: {
    200: {
      description: "Liveness status",
      content: { "application/json": { schema: anyObject } }
    }
  }
});

registry.registerPath({
  method: "get",
  path: "/health/ready",
  tags: ["Health"],
  responses: {
    200: {
      description: "Readiness status",
      content: { "application/json": { schema: anyObject } }
    }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/auth/register",
  tags: ["Auth"],
  request: { body: { content: { "application/json": { schema: registerSchema } } } },
  responses: {
    201: { description: "Registered user and set session cookie", content: { "application/json": { schema: anyObject } } },
    400: { description: "Validation error", content: { "application/json": { schema: errorResponse } } },
    409: { description: "Email already registered", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/auth/login",
  tags: ["Auth"],
  request: { body: { content: { "application/json": { schema: loginSchema } } } },
  responses: {
    200: { description: "Logged in and set session cookie", content: { "application/json": { schema: anyObject } } },
    401: { description: "Invalid credentials", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/v1/auth/me",
  tags: ["Auth"],
  responses: {
    200: { description: "Current authenticated user", content: { "application/json": { schema: anyObject } } },
    401: { description: "Authentication required", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/auth/logout",
  tags: ["Auth"],
  responses: {
    200: { description: "Cleared session cookie", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/sessions",
  tags: ["Sessions"],
  request: { body: { content: { "application/json": { schema: createSessionSchema } } } },
  responses: {
    201: { description: "Created session", content: { "application/json": { schema: anyObject } } },
    400: { description: "Validation error", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/v1/sessions",
  tags: ["Sessions"],
  responses: {
    200: { description: "Session list", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/v1/sessions/{sessionId}",
  tags: ["Sessions"],
  request: { params: z.object({ sessionId: z.string() }) },
  responses: {
    200: { description: "Session detail", content: { "application/json": { schema: anyObject } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/v1/sessions/{sessionId}/timeline",
  tags: ["Sessions"],
  request: { params: z.object({ sessionId: z.string() }) },
  responses: {
    200: { description: "Session timeline", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/sessions/{sessionId}/end",
  tags: ["Sessions"],
  request: {
    params: z.object({ sessionId: z.string() }),
    body: { content: { "application/json": { schema: endSessionSchema } } }
  },
  responses: {
    200: { description: "Ended session", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/spans",
  tags: ["Spans"],
  request: { body: { content: { "application/json": { schema: createSpanSchema } } } },
  responses: {
    201: { description: "Created span", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/v1/spans/{spanId}",
  tags: ["Spans"],
  request: { params: z.object({ spanId: z.string() }) },
  responses: {
    200: { description: "Span detail", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/spans/{spanId}/end",
  tags: ["Spans"],
  request: {
    params: z.object({ spanId: z.string() }),
    body: { content: { "application/json": { schema: endSpanSchema } } }
  },
  responses: {
    200: { description: "Ended span", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/events",
  tags: ["Events"],
  request: { body: { content: { "application/json": { schema: createEventSchema } } } },
  responses: {
    201: { description: "Recorded event", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/errors",
  tags: ["Errors"],
  request: { body: { content: { "application/json": { schema: createErrorSchema } } } },
  responses: {
    201: { description: "Recorded error", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "get",
  path: "/v1/projects/current/export-destinations",
  tags: ["Exports"],
  responses: {
    200: { description: "Export destination list", content: { "application/json": { schema: anyObject } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/projects/current/export-destinations",
  tags: ["Exports"],
  request: { body: { content: { "application/json": { schema: createExportDestinationSchema } } } },
  responses: {
    201: { description: "Created export destination", content: { "application/json": { schema: anyObject } } },
    400: { description: "Validation error", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "put",
  path: "/v1/projects/current/export-destinations/{destinationId}",
  tags: ["Exports"],
  request: {
    params: z.object({ destinationId: z.string() }),
    body: { content: { "application/json": { schema: updateExportDestinationSchema } } }
  },
  responses: {
    200: { description: "Updated export destination", content: { "application/json": { schema: anyObject } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "delete",
  path: "/v1/projects/current/export-destinations/{destinationId}",
  tags: ["Exports"],
  request: { params: z.object({ destinationId: z.string() }) },
  responses: {
    200: { description: "Deleted export destination", content: { "application/json": { schema: anyObject } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponse } } }
  }
});

registry.registerPath({
  method: "post",
  path: "/v1/projects/current/export-destinations/{destinationId}/test",
  tags: ["Exports"],
  request: { params: z.object({ destinationId: z.string() }) },
  responses: {
    200: { description: "Export destination test result", content: { "application/json": { schema: anyObject } } },
    404: { description: "Not found", content: { "application/json": { schema: errorResponse } } }
  }
});

export function createOpenApiDocument(): Record<string, unknown> {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "TraceLLM API",
      version: "0.1.0",
      description: "Backend API for LLM sessions, spans, events, errors, and telemetry export."
    },
    servers: [{ url: env.TRACELLM_PUBLIC_API_URL }]
  }) as unknown as Record<string, unknown>;
}
