import { useQuery } from "@tanstack/react-query";
import { getSessionTimeline } from "../api/sessionsApi.js";

export function useSessionTimeline(sessionId: string | null) {
  return useQuery({
    queryKey: ["session-timeline", sessionId],
    queryFn: () => getSessionTimeline(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: 8_000
  });
}
