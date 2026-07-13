import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  CHATBOT_PORT: z.coerce.number().int().positive().default(4320),
  CHATBOT_PROVIDER: z.enum(["openai", "anthropic", "gemini"]).default("openai"),
  CHATBOT_USER_ID: z.string().default("local-chatbot-user"),
  CHATBOT_SIMULATE_PROVIDER_ERROR: z
    .string()
    .default("false")
    .transform((value) => value === "true" || value === "1" || value.toLowerCase() === "yes"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-latest"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  TRACELLM_ENABLED: z
    .string()
    .default("false")
    .transform((value) => value === "true" || value === "1" || value.toLowerCase() === "yes"),
  TRACELLM_ENDPOINT: z.string().url().default("https://api.tracellm.in"),
  TRACELLM_API_KEY: z.string().optional(),
  TRACELLM_SERVICE_NAME: z.string().default("tracellm-chatbot"),
  TRACELLM_CAPTURE_CONTENT: z
    .string()
    .default("false")
    .transform((value) => value === "true" || value === "1" || value.toLowerCase() === "yes"),
  TRACELLM_CONFIG_REFRESH_MS: z.coerce.number().int().nonnegative().default(30_000)
});

export const env = envSchema.parse(process.env);

export type ChatProvider = typeof env.CHATBOT_PROVIDER;

export function providerModel(provider = env.CHATBOT_PROVIDER): string {
  if (provider === "openai") {
    return env.OPENAI_MODEL;
  }
  if (provider === "anthropic") {
    return env.ANTHROPIC_MODEL;
  }
  return env.GEMINI_MODEL;
}

export function hasProviderKey(provider = env.CHATBOT_PROVIDER): boolean {
  if (provider === "openai") {
    return Boolean(env.OPENAI_API_KEY);
  }
  if (provider === "anthropic") {
    return Boolean(env.ANTHROPIC_API_KEY);
  }
  return Boolean(env.GEMINI_API_KEY);
}
