import { useQuery } from "@tanstack/react-query";
import { getSessions } from "../api/sessionsApi.js";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    refetchInterval: 10_000
  });
}
