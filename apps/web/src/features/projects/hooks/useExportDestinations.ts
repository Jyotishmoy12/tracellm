import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExportDestination,
  deleteExportDestination,
  getExportDestinations,
  testExportDestination,
  updateExportDestination
} from "../api/projectApi.js";
import type { ExportDestinationInput } from "../types.js";

const queryKey = ["export-destinations"];

export function useExportDestinations() {
  return useQuery({
    queryKey,
    queryFn: getExportDestinations
  });
}

export function useCreateExportDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExportDestinationInput) => createExportDestination(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
}

export function useUpdateExportDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExportDestinationInput> }) =>
      updateExportDestination(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
}

export function useDeleteExportDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExportDestination(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });
}

export function useTestExportDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => testExportDestination(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });
}
