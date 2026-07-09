import { env } from "./config/env.config.js";
import { createApp } from "./app.js";
import { initializeTelemetry, shutdownTelemetry } from "./telemetry/otel.js";

await initializeTelemetry();

const app = createApp();
const server = app.listen(env.TRACELLM_PORT, () => {
  console.log(`TraceLLM server listening on ${env.TRACELLM_PUBLIC_API_URL}`);
  console.log(`Swagger UI available at ${env.TRACELLM_PUBLIC_API_URL}/api-docs`);
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down TraceLLM server`);
  server.close(async () => {
    await shutdownTelemetry();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
