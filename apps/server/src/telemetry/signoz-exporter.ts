import { telemetryConfig } from "../config/telemetry.config.js";

export const signozExporterConfig = {
  enabled: telemetryConfig.enabled,
  tracesUrl: `${telemetryConfig.endpoint}/v1/traces`,
  metricsUrl: `${telemetryConfig.endpoint}/v1/metrics`,
  headers: telemetryConfig.headers
};
