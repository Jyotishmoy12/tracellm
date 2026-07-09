import { AlertTriangle, Blocks, Clock3, Coins, Hash, Timer } from "lucide-react";
import { formatDateTime, formatDuration, formatNumber } from "../../../shared/utils/format.js";
import type { SessionTimelineResponse, TimelineItem } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";

interface SessionSummaryProps {
  timeline: SessionTimelineResponse;
}

export function SessionSummary({ timeline }: SessionSummaryProps) {
  const spans = timeline.timeline.filter((item) => item.type === "span");
  const errors = timeline.timeline.filter((item) => item.type === "error");
  const totalTokens = timeline.timeline.reduce((sum, item) => {
    if (item.type !== "span") {
      return sum;
    }

    return sum + (item.data.usage ?? []).reduce((usageSum, usage) => usageSum + (usage.totalTokens ?? 0), 0);
  }, 0);

  return (
    <section className="summary-panel">
      <div className="summary-panel__title">
        <div>
          <p className="eyebrow">Session Detail</p>
          <h2>{timeline.session.name}</h2>
        </div>
        <StatusBadge status={timeline.session.status} />
      </div>

      <div className="metric-grid">
        <Metric icon={<Timer size={18} />} label="Duration" value={formatDuration(timeline.session.durationMs)} />
        <Metric icon={<Blocks size={18} />} label="Spans" value={formatNumber(spans.length)} />
        <Metric icon={<Coins size={18} />} label="Tokens" value={formatNumber(totalTokens)} />
        <Metric icon={<AlertTriangle size={18} />} label="Errors" value={formatNumber(errors.length)} />
      </div>

      <div className="summary-panel__details">
        <Detail icon={<Hash size={15} />} label="Session" value={timeline.session.id} />
        <Detail icon={<Hash size={15} />} label="Trace" value={timeline.session.traceId} />
        <Detail icon={<Clock3 size={15} />} label="Started" value={formatDateTime(timeline.session.startedAt)} />
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      <div className="metric__icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="detail-line">
      {icon}
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}
