export class TraceEventModel {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly name: string,
    public readonly occurredAt: string
  ) {}
}
