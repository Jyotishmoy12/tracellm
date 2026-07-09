import request from "supertest";
import { eq } from "drizzle-orm/sql/expressions";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { db } from "./database/client.js";
import { exportDestinations } from "./database/schema.js";

const app = createApp();

describe("TraceLLM API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns live and ready health probes", async () => {
    const live = await request(app).get("/health/live");
    const ready = await request(app).get("/health/ready");

    expect(live.status).toBe(200);
    expect(live.body.status).toBe("live");
    expect(ready.status).toBe(200);
    expect(ready.body.status).toBe("ready");
  });

  it("serves OpenAPI JSON", async () => {
    const response = await request(app).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.info.title).toBe("TraceLLM API");
  });

  it("lists and creates project API keys", async () => {
    const listResponse = await request(app).get("/v1/projects/current/api-keys");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.length).toBeGreaterThanOrEqual(1);
    expect(listResponse.body.data[0].prefix).toBeTruthy();
    expect(listResponse.body.data[0].apiKey).toBeUndefined();

    const createResponse = await request(app).post("/v1/projects/current/api-keys").send({ name: "Test SDK key" });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.apiKey).toMatch(/^trllm_/);
    expect(createResponse.body.prefix).toBeTruthy();

    const revokeResponse = await request(app).delete(`/v1/projects/current/api-keys/${createResponse.body.id}`);
    expect(revokeResponse.status).toBe(200);
    expect(revokeResponse.body.revoked).toBe(true);
  });

  it("creates, masks, updates, tests, and deletes export destinations", async () => {
    const agent = request.agent(app);
    const email = `exports-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Exports Test",
      workspaceName: "Exports Test Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const createResponse = await agent.post("/v1/projects/current/export-destinations").send({
      name: "Local SigNoz",
      endpoint: "http://127.0.0.1:9",
      headers: {
        "signoz-ingestion-key": "secret-value"
      }
    });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.headers).toEqual({ "signoz-ingestion-key": "********" });

    const stored = await db
      .select()
      .from(exportDestinations)
      .where(eq(exportDestinations.id, createResponse.body.id))
      .get();
    expect(stored?.encryptedHeaders).toBeTruthy();
    expect(stored?.encryptedHeaders).not.toContain("secret-value");

    const listResponse = await agent.get("/v1/projects/current/export-destinations");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data[0].headers["signoz-ingestion-key"]).toBe("********");

    const updateResponse = await agent.put(`/v1/projects/current/export-destinations/${createResponse.body.id}`).send({
      enabled: false
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.enabled).toBe(false);

    const testResponse = await agent.post(`/v1/projects/current/export-destinations/${createResponse.body.id}/test`);
    expect(testResponse.status).toBe(200);
    expect(testResponse.body.ok).toBe(false);

    const deleteResponse = await agent.delete(`/v1/projects/current/export-destinations/${createResponse.body.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.deleted).toBe(true);
  });

  it("rejects invalid export destination endpoints", async () => {
    const response = await request(app).post("/v1/projects/current/export-destinations").send({
      name: "Broken",
      endpoint: "not-a-url"
    });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Validation failed");
  });

  it("keeps export destinations scoped to their owning project", async () => {
    const first = request.agent(app);
    const second = request.agent(app);

    await first.post("/v1/auth/register").send({
      email: `exports-owner-${Date.now()}@example.com`,
      password: "correct horse battery",
      workspaceName: "Export Owner Workspace"
    });
    await second.post("/v1/auth/register").send({
      email: `exports-other-${Date.now()}@example.com`,
      password: "correct horse battery",
      workspaceName: "Export Other Workspace"
    });

    const created = await first.post("/v1/projects/current/export-destinations").send({
      name: "Owner Collector",
      endpoint: "http://127.0.0.1:4318"
    });
    expect(created.status).toBe(201);

    const otherList = await second.get("/v1/projects/current/export-destinations");
    expect(otherList.status).toBe(200);
    expect(otherList.body.data).toEqual([]);

    const otherDelete = await second.delete(`/v1/projects/current/export-destinations/${created.body.id}`);
    expect(otherDelete.status).toBe(404);
  });

  it("does not fail ingest when an enabled export destination is unreachable", async () => {
    const agent = request.agent(app);
    const email = `export-ingest-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      workspaceName: "Export Ingest Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const destinationResponse = await agent.post("/v1/projects/current/export-destinations").send({
      name: "Unreachable Collector",
      endpoint: "http://127.0.0.1:9"
    });
    expect(destinationResponse.status).toBe(201);

    const sessionResponse = await agent.post("/v1/sessions").send({ name: "Export does not block" });
    expect(sessionResponse.status).toBe(201);

    const spanResponse = await agent.post("/v1/spans").send({
      sessionId: sessionResponse.body.id,
      name: "openai.chat.complete",
      kind: "llm"
    });
    expect(spanResponse.status).toBe(201);

    const endResponse = await agent.post(`/v1/spans/${spanResponse.body.id}/end`).send({ status: "ok" });
    expect(endResponse.status).toBe(200);
  });

  it("registers, stores the session in an HttpOnly cookie, and reads the current user", async () => {
    const agent = request.agent(app);
    const email = `auth-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Auth Test",
      workspaceName: "Auth Test Workspace"
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.email).toBe(email);
    const setCookie = registerResponse.headers["set-cookie"];
    expect(Array.isArray(setCookie) ? setCookie.join(";") : setCookie).toContain("HttpOnly");

    const meResponse = await agent.get("/v1/auth/me");
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe(email);
    expect(meResponse.body.workspace.name).toBe("Auth Test Workspace");

    const configResponse = await agent.get("/v1/projects/current/config");
    expect(configResponse.status).toBe(200);
    expect(configResponse.body.projectName).toBe("Default Project");

    const logoutResponse = await agent.post("/v1/auth/logout");
    expect(logoutResponse.status).toBe(200);
  });

  it("persists project tracing config changes", async () => {
    const agent = request.agent(app);
    const email = `config-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Config Test",
      workspaceName: "Config Test Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const updateResponse = await agent.put("/v1/projects/current/config").send({
      captureContent: true,
      captureInputs: true,
      captureOutputs: true
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.tracingConfig.captureContent).toBe(true);
    expect(updateResponse.body.tracingConfig.captureInputs).toBe(true);
    expect(updateResponse.body.tracingConfig.captureOutputs).toBe(true);

    const readResponse = await agent.get("/v1/projects/current/config");
    expect(readResponse.status).toBe(200);
    expect(readResponse.body.tracingConfig.captureContent).toBe(true);
    expect(readResponse.body.tracingConfig.captureInputs).toBe(true);
    expect(readResponse.body.tracingConfig.captureOutputs).toBe(true);
  });

  it("redacts captured emails and API keys before storage", async () => {
    const agent = request.agent(app);
    const email = `redaction-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Redaction Test",
      workspaceName: "Redaction Test Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const configResponse = await agent.put("/v1/projects/current/config").send({
      captureContent: true,
      redaction: {
        enabled: true,
        emails: true,
        apiKeys: true
      }
    });
    expect(configResponse.status).toBe(200);

    const sessionResponse = await agent.post("/v1/sessions").send({
      name: "Redaction session",
      input: "Contact jane@example.com with key sk_test_123456789",
      output: "Sent to jane@example.com"
    });

    expect(sessionResponse.status).toBe(201);
    expect(sessionResponse.body.input).toBe("Contact [redacted-email] with key [redacted-key]");
    expect(sessionResponse.body.output).toBe("Sent to [redacted-email]");

    const spanResponse = await agent.post("/v1/spans").send({
      sessionId: sessionResponse.body.id,
      name: "openai.chat.complete",
      kind: "llm",
      input: "Use jane@example.com and sk_test_123456789"
    });

    expect(spanResponse.status).toBe(201);
    expect(spanResponse.body.input).toBe("Use [redacted-email] and [redacted-key]");

    const endSpanResponse = await agent.post(`/v1/spans/${spanResponse.body.id}/end`).send({
      status: "ok",
      output: "Answer for jane@example.com"
    });

    expect(endSpanResponse.status).toBe(200);
    expect(endSpanResponse.body.output).toBe("Answer for [redacted-email]");
  });

  it("does not persist usage when token usage capture is disabled", async () => {
    const agent = request.agent(app);
    const email = `usage-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Usage Test",
      workspaceName: "Usage Test Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const configResponse = await agent.put("/v1/projects/current/config").send({
      captureTokenUsage: false
    });
    expect(configResponse.status).toBe(200);
    expect(configResponse.body.tracingConfig.captureTokenUsage).toBe(false);

    const sessionResponse = await agent.post("/v1/sessions").send({ name: "Usage off session" });
    expect(sessionResponse.status).toBe(201);

    const spanResponse = await agent.post("/v1/spans").send({
      sessionId: sessionResponse.body.id,
      name: "openai.chat.complete",
      kind: "llm",
      usage: {
        inputTokens: 5,
        outputTokens: 8,
        totalTokens: 13
      }
    });
    expect(spanResponse.status).toBe(201);

    const endSpanResponse = await agent.post(`/v1/spans/${spanResponse.body.id}/end`).send({
      status: "ok",
      usage: {
        inputTokens: 6,
        outputTokens: 9,
        totalTokens: 15
      }
    });
    expect(endSpanResponse.status).toBe(200);

    const timelineResponse = await agent.get(`/v1/sessions/${sessionResponse.body.id}/timeline`);
    expect(timelineResponse.status).toBe(200);

    const spanItem = timelineResponse.body.timeline.find(
      (item: { type: string; data: { id?: string } }) => item.type === "span" && item.data.id === spanResponse.body.id
    );
    expect(spanItem.data.usage).toEqual([]);
  });

  it("does not persist attributes when metadata capture is disabled", async () => {
    const agent = request.agent(app);
    const email = `metadata-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Metadata Test",
      workspaceName: "Metadata Test Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const configResponse = await agent.put("/v1/projects/current/config").send({
      captureMetadata: false
    });
    expect(configResponse.status).toBe(200);
    expect(configResponse.body.tracingConfig.captureMetadata).toBe(false);

    const sessionResponse = await agent
      .post("/v1/sessions")
      .send({ name: "Metadata off session", attributes: { provider: "openai" } });
    expect(sessionResponse.status).toBe(201);
    expect(sessionResponse.body.attributes).toEqual({});

    const spanResponse = await agent.post("/v1/spans").send({
      sessionId: sessionResponse.body.id,
      name: "openai.chat.complete",
      kind: "llm",
      attributes: { model: "gpt-4.1-mini" }
    });
    expect(spanResponse.status).toBe(201);
    expect(spanResponse.body.attributes).toEqual({});

    const eventResponse = await agent.post("/v1/events").send({
      sessionId: sessionResponse.body.id,
      spanId: spanResponse.body.id,
      name: "provider.response.received",
      attributes: { totalTokens: 10 }
    });
    expect(eventResponse.status).toBe(201);
    expect(eventResponse.body.attributes).toEqual({});

    const errorResponse = await agent.post("/v1/errors").send({
      sessionId: sessionResponse.body.id,
      spanId: spanResponse.body.id,
      name: "exception",
      message: "Provider failed",
      attributes: { provider: "openai" }
    });
    expect(errorResponse.status).toBe(201);
    expect(errorResponse.body.attributes).toEqual({});
  });

  it("ignores spans whose kind is disabled by project config", async () => {
    const agent = request.agent(app);
    const email = `ignored-${Date.now()}@example.com`;

    const registerResponse = await agent.post("/v1/auth/register").send({
      email,
      password: "correct horse battery",
      name: "Ignored Span Test",
      workspaceName: "Ignored Span Test Workspace"
    });
    expect(registerResponse.status).toBe(201);

    const configResponse = await agent.put("/v1/projects/current/config").send({
      ignoredSpanKinds: ["llm"]
    });
    expect(configResponse.status).toBe(200);
    expect(configResponse.body.tracingConfig.ignoredSpanKinds).toEqual(["llm"]);

    const sessionResponse = await agent.post("/v1/sessions").send({ name: "Ignored span session" });
    expect(sessionResponse.status).toBe(201);

    const ignoredSpanResponse = await agent.post("/v1/spans").send({
      sessionId: sessionResponse.body.id,
      name: "openai.chat.complete",
      kind: "llm"
    });
    expect(ignoredSpanResponse.status).toBe(202);

    const timelineResponse = await agent.get(`/v1/sessions/${sessionResponse.body.id}/timeline`);
    expect(timelineResponse.status).toBe(200);
    expect(timelineResponse.body.timeline.filter((item: { type: string }) => item.type === "span")).toEqual([]);
  });

  it("creates a session, span, event, error, and timeline", async () => {
    const sessionResponse = await request(app)
      .post("/v1/sessions")
      .send({ name: "Test session", attributes: { test: true }, input: "hidden prompt" });

    expect(sessionResponse.status).toBe(201);
    expect(sessionResponse.body.input).toBeNull();
    const sessionId = sessionResponse.body.id;

    const spanResponse = await request(app)
      .post("/v1/spans")
      .send({ sessionId, name: "llm.call", kind: "llm", usage: { totalTokens: 10 } });

    expect(spanResponse.status).toBe(201);
    const spanId = spanResponse.body.id;

    const eventResponse = await request(app)
      .post("/v1/events")
      .send({ sessionId, spanId, name: "tool.selected", attributes: { tool: "search" } });

    expect(eventResponse.status).toBe(201);

    const errorResponse = await request(app)
      .post("/v1/errors")
      .send({ sessionId, spanId, name: "exception", message: "Tool failed", type: "ToolError" });

    expect(errorResponse.status).toBe(201);

    const endSpanResponse = await request(app).post(`/v1/spans/${spanId}/end`).send({ status: "ok" });
    expect(endSpanResponse.status).toBe(200);

    const timelineResponse = await request(app).get(`/v1/sessions/${sessionId}/timeline`);
    expect(timelineResponse.status).toBe(200);
    expect(timelineResponse.body.timeline.length).toBeGreaterThanOrEqual(4);
  });

  it("rejects invalid session payloads", async () => {
    const response = await request(app).post("/v1/sessions").send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Validation failed");
  });
});
