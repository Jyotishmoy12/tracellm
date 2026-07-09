const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
const docsBaseUrl = trimTrailingSlash(import.meta.env.VITE_DOCS_BASE_URL ?? "https://docs.tracellm.in");
const openApiUrl = import.meta.env.VITE_OPENAPI_URL ?? `${apiBaseUrl}/api-docs`;
const defaultOtlpEndpoint = import.meta.env.VITE_DEFAULT_OTLP_ENDPOINT ?? "";

export const webEnv = {
  apiBaseUrl,
  docsBaseUrl,
  openApiUrl,
  defaultOtlpEndpoint
};

export function docsUrl(path = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${docsBaseUrl}${cleanPath}`;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
