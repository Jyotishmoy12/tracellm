import { Activity, AlertCircle, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDateTime, formatDuration } from "../../../shared/utils/format.js";
import type { Session, TraceStatus } from "../types.js";
import { StatusBadge } from "./StatusBadge.js";

interface SessionsListProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

const statuses: Array<TraceStatus | "all"> = ["all", "running", "ok", "error", "cancelled"];

export function SessionsList({ sessions, selectedSessionId, onSelectSession }: SessionsListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TraceStatus | "all">("all");

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesStatus = status === "all" || session.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        session.name.toLowerCase().includes(normalizedQuery) ||
        session.id.toLowerCase().includes(normalizedQuery) ||
        session.serviceName.toLowerCase().includes(normalizedQuery) ||
        session.traceId.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, sessions, status]);

  return (
    <aside className="sessions-list" aria-label="Sessions">
      <div className="sessions-list__header">
        <div>
          <p className="eyebrow">TraceLLM</p>
          <h1>Sessions</h1>
        </div>
        <div className="sessions-list__count" title="Total sessions">
          <Activity size={16} />
          <span>{sessions.length}</span>
        </div>
      </div>

      <label className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sessions"
          aria-label="Search sessions"
        />
      </label>

      <div className="segmented-control" aria-label="Filter sessions by status">
        {statuses.map((item) => (
          <button
            className={item === status ? "is-active" : ""}
            key={item}
            type="button"
            onClick={() => setStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="sessions-list__items">
        {filteredSessions.map((session) => (
          <button
            className={`session-row ${session.id === selectedSessionId ? "is-selected" : ""}`}
            key={session.id}
            type="button"
            onClick={() => onSelectSession(session.id)}
          >
            <span className="session-row__topline">
              <span className="session-row__name">{session.name}</span>
              <StatusBadge status={session.status} />
            </span>
            <span className="session-row__meta">
              <Clock size={14} />
              {formatDuration(session.durationMs)}
            </span>
            <span className="session-row__meta">{formatDateTime(session.startedAt)}</span>
            <span className="session-row__service">{session.serviceName}</span>
          </button>
        ))}

        {filteredSessions.length === 0 ? (
          <div className="sessions-list__empty">
            <AlertCircle size={18} />
            <span>No sessions match the current filters.</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
