import { metrics, trace } from "@opentelemetry/api";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { telemetryConfig } from "../config/telemetry.config.js";

let sdk: NodeSDK | undefined;

export async function initializeTelemetry(): Promise<void> {
  if (!telemetryConfig.enabled) {
    return;
  }

  const traceExporter = new OTLPTraceExporter({
    url: `${telemetryConfig.endpoint}/v1/traces`,
    headers: telemetryConfig.headers
  });
  const metricExporter = new OTLPMetricExporter({
    url: `${telemetryConfig.endpoint}/v1/metrics`,
    headers: telemetryConfig.headers
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: telemetryConfig.serviceName
    }),
    spanProcessor: new BatchSpanProcessor(traceExporter),
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10_000
    })
  });

  await sdk.start();
}

export async function shutdownTelemetry(): Promise<void> {
  await sdk?.shutdown();
}

export const tracer = trace.getTracer("tracellm-server");
export const meter = metrics.getMeter("tracellm-server");
