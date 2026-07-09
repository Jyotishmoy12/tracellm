import { apiGet, apiPost } from "../../../shared/api/client.js";
import type { AuthSession, LoginPayload, RegisterPayload } from "../types.js";

export function getMe() {
  return apiGet<AuthSession>("/v1/auth/me");
}

export function login(payload: LoginPayload) {
  return apiPost<{ user: AuthSession["user"] }>("/v1/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return apiPost<{ user: AuthSession["user"] }>("/v1/auth/register", payload);
}

export function logout() {
  return apiPost<{ loggedOut: boolean }>("/v1/auth/logout");
}
