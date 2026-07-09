import { apiGet } from "../../../shared/api/client.js";
import type { SessionTimelineResponse, SessionsResponse } from "../types.js";

export function getSessions() {
  return apiGet<SessionsResponse>("/v1/sessions");
}

export function getSessionTimeline(sessionId: string) {
  return apiGet<SessionTimelineResponse>(`/v1/sessions/${sessionId}/timeline`);
}
