import { randomUUID } from "node:crypto";

export function createId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

export function createTraceId(): string {
  return randomUUID().replaceAll("-", "");
}
