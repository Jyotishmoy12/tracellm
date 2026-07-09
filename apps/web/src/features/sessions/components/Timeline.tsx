import { AlertOctagon, Bot, Braces, CheckCircle2, CircleDot, Workflow } from "lucide-react";
import { formatDateTime, formatDuration, formatNumber } from "../../../shared/utils/format.js";
import type { TimelineItem } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <section className="timeline-panel">
      <div className="section-heading">
        <h2>Timeline</h2>
        <span>{items.length} records</span>
      </div>

      <div className="timeline">
        {items.map((item, index) => (
          <TimelineRecord item={item} key={`${item.type}-${item.timestamp}-${index}`} />
        ))}
      </div>
    </section>
  );
}

function TimelineRecord({ item }: { item: TimelineItem }) {
  const icon = getIcon(item.type);

  if (item.type === "span") {
    const totalTokens = (item.data.usage ?? []).reduce((sum, usage) => sum + (usage.totalTokens ?? 0), 0);
    return (
      <article className={`timeline-record timeline-record--${item.type}`}>
        <div className="timeline-record__rail">{icon}</div>
        <div className="timeline-record__body">
          <div className="timeline-record__header">
            <div>
              <p>{formatDateTime(item.timestamp)}</p>
              <h3>{item.data.name}</h3>
            </div>
            <StatusBadge status={item.data.status} />
          </div>
          <div className="timeline-record__facts">
            <span>{item.data.kind}</span>
            <span>{formatDuration(item.data.durationMs)}</span>
            <span>{formatNumber(totalTokens)} tokens</span>
          </div>
          <AttributeTable value={item.data.attributes} />
          <UsageBreakdown usage={item.data.usage ?? []} />
          <CapturedContent input={item.data.input} output={item.data.output} />
        </div>
      </article>
    );
  }

  if (item.type === "error") {
    return (
      <article className={`timeline-record timeline-record--${item.type}`}>
        <div className="timeline-record__rail">{icon}</div>
        <div className="timeline-record__body">
          <div className="timeline-record__header">
            <div>
              <p>{formatDateTime(item.timestamp)}</p>
              <h3>{item.data.message}</h3>
            </div>
            <span className="status-badge status-badge--error">{item.data.type ?? "Error"}</span>
          </div>
          <AttributeTable value={{ name: item.data.name, stack: item.data.stack, ...item.data.attributes }} />
        </div>
      </article>
    );
  }

  if (item.type === "event") {
    return (
      <article className={`timeline-record timeline-record--${item.type}`}>
        <div className="timeline-record__rail">{icon}</div>
        <div className="timeline-record__body">
          <div className="timeline-record__header">
            <div>
              <p>{formatDateTime(item.timestamp)}</p>
              <h3>{item.data.name}</h3>
            </div>
            <span className="record-chip">event</span>
          </div>
          <AttributeTable value={item.data.attributes} />
        </div>
      </article>
    );
  }

  return (
    <article className={`timeline-record timeline-record--${item.type}`}>
      <div className="timeline-record__rail">{icon}</div>
      <div className="timeline-record__body">
        <div className="timeline-record__header">
          <div>
            <p>{formatDateTime(item.timestamp)}</p>
            <h3>{item.data.name}</h3>
          </div>
          <StatusBadge status={item.data.status} />
        </div>
        <AttributeTable value={item.data.attributes} />
        <CapturedContent input={item.data.input} output={item.data.output} />
      </div>
    </article>
  );
}

function CapturedContent({ input, output }: { input?: string | null; output?: string | null }) {
  if (!input && !output) {
    return null;
  }

  return (
    <div className="captured-content">
      {input ? <ContentBlock label="Input" value={input} /> : null}
      {output ? <ContentBlock label="Output" value={output} /> : null}
    </div>
  );
}

function UsageBreakdown({ usage }: { usage: NonNullable<Extract<TimelineItem, { type: "span" }>["data"]["usage"]> }) {
  if (usage.length === 0) {
    return null;
  }

  const totals = usage.reduce(
    (sum, item) => ({
      inputTokens: sum.inputTokens + (item.inputTokens ?? 0),
      outputTokens: sum.outputTokens + (item.outputTokens ?? 0),
      totalTokens: sum.totalTokens + (item.totalTokens ?? 0),
      estimatedCostUsd: sum.estimatedCostUsd + (item.estimatedCostUsd ?? 0)
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0
    }
  );

  return (
    <div className="usage-breakdown" aria-label="Token usage">
      <Metric label="Input" value={formatNumber(totals.inputTokens)} />
      <Metric label="Output" value={formatNumber(totals.outputTokens)} />
      <Metric label="Total" value={formatNumber(totals.totalTokens)} />
      {totals.estimatedCostUsd > 0 ? <Metric label="Cost" value={`$${totals.estimatedCostUsd.toFixed(6)}`} /> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ContentBlock({ label, value }: { label: string; value: string }) {
  return (
    <section className="captured-content__block">
      <h4>{label}</h4>
      <pre>{value}</pre>
    </section>
  );
}

function AttributeTable({ value }: { value: Record<string, unknown> }) {
  const entries = Object.entries(value ?? {}).filter(([, item]) => item !== null && item !== undefined && item !== "");

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="attribute-table" aria-label="Trace attributes">
      {entries.map(([key, item]) => (
        <div className="attribute-row" key={key}>
          <span>{key}</span>
          <strong>{formatAttributeValue(item)}</strong>
        </div>
      ))}
    </div>
  );
}

function formatAttributeValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function getIcon(type: TimelineItem["type"]) {
  switch (type) {
    case "span":
      return <Bot size={18} />;
    case "event":
      return <CircleDot size={18} />;
    case "error":
      return <AlertOctagon size={18} />;
    case "session":
      return <Workflow size={18} />;
    default:
      return <CheckCircle2 size={18} />;
  }
}
