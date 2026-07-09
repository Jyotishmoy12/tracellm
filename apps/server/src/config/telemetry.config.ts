import { env } from "./env.config.js";

export const telemetryConfig = {
  enabled: env.TRACELLM_OTEL_ENABLED,
  endpoint: env.TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT,
  headers: parseHeaders(env.TRACELLM_OTEL_EXPORTER_OTLP_HEADERS),
  serviceName: env.TRACELLM_SERVICE_NAME
};

function parseHeaders(value: string): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const entry of value.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const headerValue = trimmed.slice(separatorIndex + 1).trim();
    if (key && headerValue) {
      headers[key] = headerValue;
    }
  }

  return headers;
}
