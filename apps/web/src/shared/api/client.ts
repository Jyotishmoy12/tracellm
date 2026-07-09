import { webEnv } from "../../config/env.js";

const apiBaseUrl = webEnv.apiBaseUrl;

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: "include"
  });
  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new Error(readErrorMessage(data, response.status));
  }

  return data as T;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new Error(readErrorMessage(data, response.status));
  }

  return data as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method: "POST",
    credentials: "include"
  };

  if (body) {
    init.headers = {
      "content-type": "application/json"
    };
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, init);
  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new Error(readErrorMessage(data, response.status));
  }

  return data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "DELETE",
    credentials: "include"
  });
  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new Error(readErrorMessage(data, response.status));
  }

  return data as T;
}

function readErrorMessage(data: unknown, status: number): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return `Request failed with status ${status}`;
}
