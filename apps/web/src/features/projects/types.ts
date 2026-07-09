export interface TracingConfig {
  enabled: boolean;
  captureContent: boolean;
  captureInputs: boolean;
  captureOutputs: boolean;
  captureToolCalls: boolean;
  captureRetrieval: boolean;
  captureErrors: boolean;
  captureTokenUsage: boolean;
  captureLatency: boolean;
  captureMetadata: boolean;
  samplingRate: number;
  redaction: {
    enabled: boolean;
    emails: boolean;
    apiKeys: boolean;
  };
  ignoredSpanKinds: string[];
  ignoredTools: string[];
}

export interface ProjectConfigResponse {
  projectId: string;
  workspaceId: string;
  projectName: string;
  apiKeyPrefix: string;
  tracingConfig: TracingConfig;
}

export interface ApiKeySummary {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export interface ApiKeysResponse {
  data: ApiKeySummary[];
}

export interface CreatedApiKey extends ApiKeySummary {
  apiKey: string;
}

export interface ExportDestination {
  id: string;
  name: string;
  type: "otlp_http";
  enabled: boolean;
  endpoint: string;
  headers: Record<string, string>;
  lastTestedAt: string | null;
  lastStatus: "ok" | "failed" | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExportDestinationsResponse {
  data: ExportDestination[];
}

export interface ExportDestinationInput {
  name: string;
  endpoint: string;
  enabled: boolean;
  headers: Record<string, string>;
}
