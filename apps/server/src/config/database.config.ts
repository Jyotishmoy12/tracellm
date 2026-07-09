import path from "node:path";
import { env } from "./env.config.js";

export const databaseConfig = {
  path: path.resolve(env.TRACELLM_DB_PATH)
};
