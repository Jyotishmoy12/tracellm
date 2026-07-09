import { z } from "zod";

const envSchema = z.object({
  TRACELLM_PORT: z.coerce.number().int().positive().default(4319),
  TRACELLM_DB_PATH: z.string().default("./data/tracellm.sqlite"),
  TRACELLM_OTEL_ENABLED: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
  TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default("http://localhost:4318"),
  TRACELLM_OTEL_EXPORTER_OTLP_HEADERS: z.string().default(""),
  TRACELLM_SERVICE_NAME: z.string().default("tracellm-server"),
  TRACELLM_PUBLIC_API_URL: z.string().url().default("http://localhost:4319"),
  TRACELLM_CAPTURE_CONTENT: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  TRACELLM_AUTH_REQUIRED: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  TRACELLM_DEV_API_KEY: z.string().default("trllm_dev_key"),
  TRACELLM_AUTH_COOKIE_NAME: z.string().default("tracellm_session"),
  TRACELLM_AUTH_COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  TRACELLM_JWT_ISSUER: z.string().default("tracellm"),
  TRACELLM_JWT_AUDIENCE: z.string().default("tracellm-web"),
  TRACELLM_JWT_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  TRACELLM_EXPORT_SECRET_KEY: z.string().default("tracellm-local-export-secret-change-me"),
  NODE_ENV: z.string().default("development")
});

export const env = envSchema.parse(process.env);

export type EnvConfig = typeof env;
