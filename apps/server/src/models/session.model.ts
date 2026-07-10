import type { TraceStatus } from "@use-tracellm/shared";

export class SessionModel {
  constructor(
    public readonly id: string,
    public readonly traceId: string,
    public readonly startedAt: string,
    public readonly status: TraceStatus
  ) {}

  isRunning(): boolean {
    return this.status === "running";
  }
}
