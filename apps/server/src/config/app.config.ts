import { env } from "./env.config.js";

export const appConfig = {
  name: "tracellm-server",
  version: "0.1.0",
  environment: env.NODE_ENV,
  captureContent: env.TRACELLM_CAPTURE_CONTENT
};
