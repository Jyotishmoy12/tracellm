import { apiDelete, apiGet, apiPost, apiPut } from "../../../shared/api/client.js";
import type {
  ApiKeysResponse,
  CreatedApiKey,
  ExportDestination,
  ExportDestinationInput,
  ExportDestinationsResponse,
  ProjectConfigResponse,
  TracingConfig
} from "../types.js";

export function getProjectConfig() {
  return apiGet<ProjectConfigResponse>("/v1/projects/current/config");
}

export function updateProjectConfig(config: Partial<TracingConfig>) {
  return apiPut<ProjectConfigResponse>("/v1/projects/current/config", config);
}

export function getApiKeys() {
  return apiGet<ApiKeysResponse>("/v1/projects/current/api-keys");
}

export async function createApiKey(name: string) {
  return apiPost<CreatedApiKey>("/v1/projects/current/api-keys", { name });
}

export async function revokeApiKey(keyId: string) {
  return apiDelete<{ revoked: boolean }>(`/v1/projects/current/api-keys/${keyId}`);
}

export function getExportDestinations() {
  return apiGet<ExportDestinationsResponse>("/v1/projects/current/export-destinations");
}

export function createExportDestination(input: ExportDestinationInput) {
  return apiPost<ExportDestination>("/v1/projects/current/export-destinations", {
    ...input,
    type: "otlp_http"
  });
}

export function updateExportDestination(destinationId: string, input: Partial<ExportDestinationInput>) {
  return apiPut<ExportDestination>(`/v1/projects/current/export-destinations/${destinationId}`, input);
}

export function deleteExportDestination(destinationId: string) {
  return apiDelete<{ deleted: boolean }>(`/v1/projects/current/export-destinations/${destinationId}`);
}

export function testExportDestination(destinationId: string) {
  return apiPost<{ ok: boolean; error?: string }>(
    `/v1/projects/current/export-destinations/${destinationId}/test`
  );
}
