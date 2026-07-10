import type { SpanKind, TraceStatus } from "@use-tracellm/shared";

export class SpanModel {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly name: string,
    public readonly kind: SpanKind,
    public readonly startedAt: string,
    public readonly status: TraceStatus
  ) {}

  isRunning(): boolean {
    return this.status === "running";
  }
}
