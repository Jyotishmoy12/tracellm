import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, register } from "../api/authApi.js";
import type { LoginPayload, RegisterPayload } from "../types.js";

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear();
      window.location.assign("/");
    }
  });
}
