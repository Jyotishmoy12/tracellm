import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApiKey, getApiKeys, getProjectConfig, revokeApiKey, updateProjectConfig } from "../api/projectApi.js";
import type { TracingConfig } from "../types.js";

export function useProjectConfig() {
  return useQuery({
    queryKey: ["project-config"],
    queryFn: getProjectConfig
  });
}

export function useUpdateProjectConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<TracingConfig>) => updateProjectConfig(config),
    onSuccess: (data) => {
      queryClient.setQueryData(["project-config"], data);
    }
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: getApiKeys
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    }
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    }
  });
}
