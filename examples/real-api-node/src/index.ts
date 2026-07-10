import { TraceLLM } from "@use-tracellm/sdk-node";

const endpoint = process.env.TRACELLM_ENDPOINT ?? "http://localhost:4319";
const apiKey = process.env.TRACELLM_API_KEY ?? "trllm_dev_key";
const targetUrl = process.env.TRACELLM_REAL_API_URL ?? "https://jsonplaceholder.typicode.com/posts/1";

const tracellm = new TraceLLM({
  endpoint,
  apiKey,
  serviceName: "real-api-node-example",
  captureContent: false
});

const session = await tracellm.startSession({
  name: "Real API request trace",
  userId: "real-api-user",
  attributes: {
    example: "real-api-node",
    targetUrl
  }
});

const span = await session.startSpan({
  name: "http.request",
  kind: "tool",
  attributes: {
    "http.method": "GET",
    "http.url": targetUrl
  }
});

try {
  const startedAt = Date.now();
  const response = await fetch(targetUrl, {
    headers: {
      "user-agent": "tracellm-real-api-example"
    }
  });
  const text = await response.text();
  const durationMs = Date.now() - startedAt;

  await span.recordEvent({
    name: "http.response",
    attributes: {
      "http.status_code": response.status,
      "http.response_bytes": text.length,
      durationMs
    }
  });

  await span.end({
    status: response.ok ? "ok" : "error",
    attributes: {
      "http.status_code": response.status,
      durationMs
    }
  });

  await session.end({
    status: response.ok ? "ok" : "error",
    attributes: {
      completed: true,
      "http.status_code": response.status
    }
  });

  console.log("TraceLLM real API example complete");
  console.log(`Target URL: ${targetUrl}`);
  console.log(`HTTP status: ${response.status}`);
  console.log(`Session ID: ${session.id}`);
  console.log(`Trace ID: ${session.traceId}`);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  const stack = error instanceof Error ? error.stack : undefined;

  await span.recordError({
    name: "http.request.failed",
    message,
    type: error instanceof Error ? error.name : "Error",
    stack
  });
  await span.end({ status: "error" });
  await session.end({ status: "error" });

  throw error;
}
