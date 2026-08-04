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
  TerminalSquare,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "../../../shared/components/EmptyState.js";
import { ThemeToggle } from "../../../shared/components/ThemeToggle.js";
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
    const media = window.matchMedia("(max-width: 980px)");
    const expandForSmallScreens = () => {
      if (media.matches) {
        setSidebarCollapsed(false);
      }
    };

    expandForSmallScreens();
    media.addEventListener("change", expandForSmallScreens);
    return () => media.removeEventListener("change", expandForSmallScreens);
  }, []);

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0]!.id);
    }
  }, [selectedSessionId, sessions]);

  const timelineQuery = useSessionTimeline(selectedSessionId);
  const isRefreshingTraces = sessionsQuery.isFetching || timelineQuery.isFetching;

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
        {!sidebarCollapsed ? <ThemeToggle /> : null}
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
                    className={`icon-button refresh-button ${isRefreshingTraces ? "is-spinning" : ""}`}
                    type="button"
                    onClick={() => {
                      void sessionsQuery.refetch();
                      void timelineQuery.refetch();
                    }}
                    disabled={isRefreshingTraces}
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
                    <TracesEmptyState onOpenView={setActiveView} />
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

function TracesEmptyState({ onOpenView }: { onOpenView: (view: DashboardView) => void }) {
  return (
    <section className="traces-empty-panel">
      <div className="traces-empty-panel__icon">
        <DatabaseZap size={22} />
      </div>
      <div>
        <p className="eyebrow">Trace Explorer</p>
        <h2>No traces yet</h2>
        <p>
          Connect your application with a project API key. New sessions will appear
          here as soon as the SDK records a real LLM workflow.
        </p>
      </div>
      <div className="traces-empty-panel__actions">
        <button type="button" onClick={() => onOpenView("apiKeys")}>
          <KeyRound size={15} />
          API keys
        </button>
        <button type="button" onClick={() => onOpenView("config")}>
          <Settings2 size={15} />
          Capture policy
        </button>
      </div>
    </section>
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
  const setupSteps = [
    {
      title: "Create an API key",
      description: "Generate a project key for your app.",
      action: "Open keys",
      view: "apiKeys" as const
    },
    {
      title: "Install the SDK",
      description: "Add TraceLLM to the app you want to observe.",
      action: "View traces",
      view: "traces" as const
    },
    {
      title: "Tune capture policy",
      description: "Choose content, tokens, metadata, redaction, and sampling.",
      action: "Configure",
      view: "config" as const
    },
    {
      title: "Forward OTLP",
      description: "Optionally export selected spans to your own collector.",
      action: "Exports",
      view: "exports" as const
    }
  ];

  return (
    <section className="dashboard-home">
      <div className="dashboard-home__header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{workspaceName}</h1>
          <p>
            Connect a real AI app, choose what gets captured, then inspect every
            session as it arrives.
          </p>
        </div>
        <button className="dashboard-header-action" type="button" onClick={() => onOpenView("apiKeys")}>
          <KeyRound size={16} />
          Connect app
        </button>
      </div>

      <div className="dashboard-workbench">
        <div className="dashboard-setup-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Setup Queue</p>
              <h2>Start tracing</h2>
            </div>
            <span>{sessionsCount} traces</span>
          </div>

          <div className="dashboard-step-list">
            {setupSteps.map((step, index) => (
              <button
                className="dashboard-step"
                key={step.title}
                type="button"
                onClick={() => onOpenView(step.view)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
                <em>{step.action}</em>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-code-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SDK</p>
              <h2>Connect from Node</h2>
            </div>
            <TerminalSquare size={18} />
          </div>
          <pre>{`import { TraceLLM } from "@use-tracellm/sdk-node";

const trace = new TraceLLM({
  apiKey: process.env.TRACELLM_API_KEY,
  endpoint: "https://api.tracellm.in"
});

await trace.span("openai.chat.complete", async (span) => {
  span.setAttributes({ provider: "openai", model: "gpt-4.1-mini" });
  return runModelCall();
});`}</pre>
        </div>
      </div>

      <div className="dashboard-quick-grid">
        <button className="dashboard-quick-card" type="button" onClick={() => onOpenView("traces")}>
          <Workflow size={17} />
          <span>Trace Explorer</span>
          <strong>{sessionsCount} sessions</strong>
        </button>
        <button className="dashboard-quick-card" type="button" onClick={() => onOpenView("config")}>
          <Settings2 size={17} />
          <span>Capture Policy</span>
          <strong>Inputs, outputs, tokens</strong>
        </button>
        <button className="dashboard-quick-card" type="button" onClick={() => onOpenView("exports")}>
          <Share2 size={17} />
          <span>OTLP Exports</span>
          <strong>SigNoz, Tempo, Honeycomb</strong>
        </button>
        <div className="dashboard-quick-card dashboard-quick-card--static">
          <Gauge size={17} />
          <span>Status</span>
          <strong>{sessionsCount > 0 ? "Receiving traces" : "Waiting for app"}</strong>
        </div>
      </div>
    </section>
  );
}
