import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.config.js";

const algorithm = "aes-256-gcm";

function key(): Buffer {
  return createHash("sha256").update(env.TRACELLM_EXPORT_SECRET_KEY).digest();
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, key(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptJson<T>(value: string, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    const [version, iv, tag, ciphertext] = value.split(":");
    if (version !== "v1" || !iv || !tag || !ciphertext) {
      return fallback;
    }

    const decipher = createDecipheriv(algorithm, key(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64")),
      decipher.final()
    ]).toString("utf8");
    return JSON.parse(plaintext) as T;
  } catch {
    return fallback;
  }
}
