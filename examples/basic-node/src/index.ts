import { TraceLLM } from "@use-tracellm/sdk-node";

const tracellm = new TraceLLM({
  endpoint: process.env.TRACELLM_ENDPOINT ?? "http://localhost:4319",
  apiKey: process.env.TRACELLM_API_KEY ?? "trllm_dev_key",
  serviceName: "basic-node-example",
  captureContent: false
});

const session = await tracellm.startSession({
  name: "Basic Node SDK smoke test",
  userId: "demo-user",
  attributes: {
    example: "basic-node"
  },
  input: "This content should not be captured by default"
});

const span = await session.startSpan({
  name: "llm.call",
  kind: "llm",
  attributes: {
    provider: "mock",
    model: "mock-llm"
  }
});

await span.recordEvent({
  name: "prompt.rendered",
  attributes: {
    template: "demo"
  }
});

await span.end({
  status: "ok",
  usage: {
    inputTokens: 18,
    outputTokens: 24,
    totalTokens: 42,
    estimatedCostUsd: 0.0001
  },
  output: "This content should not be captured by default"
});

await session.end({
  status: "ok",
  attributes: {
    completed: true
  }
});

console.log("TraceLLM example complete");
console.log(`Session ID: ${session.id}`);
console.log(`Timeline: http://localhost:4319/v1/sessions/${session.id}/timeline`);
