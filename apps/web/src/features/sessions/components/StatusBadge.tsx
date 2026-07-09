import type { TraceStatus } from "../types.js";

interface StatusBadgeProps {
  status: TraceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{status}</span>;
}
