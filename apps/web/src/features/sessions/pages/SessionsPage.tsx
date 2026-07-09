import {
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  Gauge,
  Home,
  KeyRound,
  LogOut,
  RefreshCw,
  ServerCrash,
  Share2,
  Settings2,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "../../../shared/components/EmptyState.js";
import { useLogout } from "../../auth/hooks/useAuth.js";
import type { AuthSession } from "../../auth/types.js";
import { ExportDestinationsPanel } from "../../projects/components/ExportDestinationsPanel.js";
import { ProjectSettingsPanel } from "../../projects/components/ProjectSettingsPanel.js";
import { SessionsList } from "../components/SessionsList.js";
import { SessionSummary } from "../components/SessionSummary.js";
import { Timeline } from "../components/Timeline.js";
import { useSessionTimeline } from "../hooks/useSessionTimeline.js";
import { useSessions } from "../hooks/useSessions.js";

type DashboardView = "home" | "traces" | "config" | "apiKeys" | "exports";

const dashboardNav: Array<{ id: DashboardView; label: string; icon: ReactNode }> = [
  { id: "home", label: "Home", icon: <Home size={18} /> },
  { id: "traces", label: "Traces", icon: <Workflow size={18} /> },
  { id: "config", label: "Config", icon: <Settings2 size={18} /> },
  { id: "apiKeys", label: "API Keys", icon: <KeyRound size={18} /> },
  { id: "exports", label: "Exports", icon: <Share2 size={18} /> }
];

export function SessionsPage({ session }: { session: AuthSession }) {
  const sessionsQuery = useSessions();
  const logout = useLogout();
  const sessions = useMemo(() => sessionsQuery.data?.data ?? [], [sessionsQuery.data?.data]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0]!.id);
    }
  }, [selectedSessionId, sessions]);

  const timelineQuery = useSessionTimeline(selectedSessionId);

  return (
    <main className={`dashboard-shell ${sidebarCollapsed ? "dashboard-shell--collapsed" : ""}`}>
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          {!sidebarCollapsed ? (
            <div>
              <a href="/" className="dashboard-sidebar__logo">tracellm</a>
              <p>AI observability</p>
            </div>
          ) : null}
          <button
            className="icon-button"
            type="button"
            onClick={() => setSidebarCollapsed((current) => !current)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {!sidebarCollapsed ? <p className="dashboard-nav__label">Explore</p> : null}
          {dashboardNav.map((item) => (
            <button
              className={`dashboard-nav__item ${activeView === item.id ? "is-active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed ? <span>{item.label}</span> : null}
            </button>
          ))}
        </nav>

        <button
          className="dashboard-nav__item dashboard-nav__item--logout"
          type="button"
          onClick={() => logout.mutate()}
          title={sidebarCollapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {!sidebarCollapsed ? <span>Logout</span> : null}
        </button>
      </aside>

      <section className="workspace">
        {sessionsQuery.isLoading ? (
          <EmptyState
            icon={<DatabaseZap size={28} />}
            title="Loading traces"
            description="Connecting to the TraceLLM backend."
          />
        ) : null}

        {sessionsQuery.isError ? (
          <EmptyState
            icon={<ServerCrash size={28} />}
            title="Backend unavailable"
            description={sessionsQuery.error.message}
          />
        ) : null}

        {!sessionsQuery.isLoading && !sessionsQuery.isError ? (
          <div className="workspace__content">
            {activeView === "home" ? (
              <DashboardHome
                sessionsCount={sessions.length}
                workspaceName={session.workspace?.name ?? session.user.email}
                onOpenView={setActiveView}
              />
            ) : null}

            {activeView === "traces" ? (
              <div className="traces-workspace">
                <div className="traces-toolbar">
                  <span className="workspace-pill">{session.workspace?.name ?? session.user.email}</span>
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => {
                      void sessionsQuery.refetch();
                      void timelineQuery.refetch();
                    }}
                    title="Refresh traces"
                    aria-label="Refresh traces"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                <SessionsList
                  sessions={sessions}
                  selectedSessionId={selectedSessionId}
                  onSelectSession={setSelectedSessionId}
                />
                <div className="traces-workspace__detail">
                  {sessions.length === 0 ? (
                    <EmptyState
                      icon={<DatabaseZap size={28} />}
                      title="No traces yet"
                      description="Create or copy an API key, then run your application with a real LLM provider key."
                    />
                  ) : null}
                  {timelineQuery.data ? (
                    <>
                      <SessionSummary timeline={timelineQuery.data} />
                      <Timeline items={timelineQuery.data.timeline} />
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeView === "config" ? <ProjectSettingsPanel section="config" /> : null}
            {activeView === "apiKeys" ? <ProjectSettingsPanel section="apiKeys" /> : null}
            {activeView === "exports" ? <ExportDestinationsPanel /> : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function DashboardHome({
  sessionsCount,
  workspaceName,
  onOpenView
}: {
  sessionsCount: number;
  workspaceName: string;
  onOpenView: (view: DashboardView) => void;
}) {
  return (
    <section className="dashboard-home">
      <div className="dashboard-home__hero">
        <div>
          <p className="eyebrow">Welcome</p>
          <h1>Hello, {workspaceName}</h1>
          <p>
            Start by creating an API key, tune what TraceLLM should capture,
            then inspect traces from your real AI application.
          </p>
        </div>
        <div className="dashboard-health-card">
          <Gauge size={18} />
          <span>Workspace health</span>
          <strong>{sessionsCount} traces</strong>
        </div>
      </div>

      <div className="dashboard-signal-grid">
        <SignalCard label="Signals" value="Traces" detail="Sessions, spans, events" />
        <SignalCard label="Capture" value="Configurable" detail="Content, tokens, errors" />
        <SignalCard label="Export" value="OTLP" detail="SigNoz compatible" />
      </div>

      <div className="dashboard-action-grid">
        <ActionCard
          index="01"
          title="Create or copy an API key"
          description="Use a project-scoped key to connect the SDK to this workspace."
          onClick={() => onOpenView("apiKeys")}
        />
        <ActionCard
          index="02"
          title="Configure capture policy"
          description="Choose content capture, redaction, sampling, metadata, tokens, and errors."
          onClick={() => onOpenView("config")}
        />
        <ActionCard
          index="03"
          title="View incoming traces"
          description={`${sessionsCount} trace${sessionsCount === 1 ? "" : "s"} available in this workspace.`}
          onClick={() => onOpenView("traces")}
        />
        <ActionCard
          index="04"
          title="Forward to your collector"
          description="Send a project trace copy to SigNoz, Tempo, Honeycomb, or any OTLP backend."
          onClick={() => onOpenView("exports")}
        />
      </div>
    </section>
  );
}

function SignalCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="dashboard-signal-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

function ActionCard({
  index,
  title,
  description,
  onClick
}: {
  index: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="dashboard-action-card" type="button" onClick={onClick}>
      <span>{index}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </button>
  );
}
