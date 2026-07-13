import type { ChatConfig, ChatResponse } from "../types.js";

interface DiagnosticsPanelProps {
  config?: ChatConfig | undefined;
  latest?: ChatResponse | undefined;
  error?: string | undefined;
}

export function DiagnosticsPanel({ config, latest, error }: DiagnosticsPanelProps) {
  return (
    <aside className="diagnostics">
      <section>
        <h2>Environment</h2>
        <dl>
          <div>
            <dt>Provider</dt>
            <dd>{config?.provider ?? "loading"}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{config?.model ?? "loading"}</dd>
          </div>
          <div>
            <dt>Provider key</dt>
            <dd>{config?.hasProviderKey ? "configured" : "missing"}</dd>
          </div>
          <div>
            <dt>TraceLLM</dt>
            <dd>{config?.traceLLM.enabled ? "enabled" : "disabled"}</dd>
          </div>
          <div>
            <dt>TraceLLM key</dt>
            <dd>{config?.traceLLM.hasApiKey ? "configured" : "missing"}</dd>
          </div>
          <div>
            <dt>TraceLLM endpoint</dt>
            <dd>{config?.traceLLM.endpoint ?? "loading"}</dd>
          </div>
          <div>
            <dt>Content capture</dt>
            <dd>{config?.traceLLM.captureContent ? "enabled" : "disabled"}</dd>
          </div>
        </dl>
        {config?.traceLLM.note ? <p className="note">{config.traceLLM.note}</p> : null}
      </section>

      {latest ? (
        <section>
          <h2>Last response</h2>
          <dl>
            <div>
              <dt>Latency</dt>
              <dd>{latest.latencyMs} ms</dd>
            </div>
            <div>
              <dt>Tokens</dt>
              <dd>{latest.usage.totalTokens}</dd>
            </div>
            <div>
              <dt>Mode</dt>
              <dd>{latest.mode}</dd>
            </div>
          </dl>

          <div className="steps">
            {latest.diagnostics.map((step) => (
              <div className="step" key={`${step.kind}-${step.name}`}>
                <span>{step.kind}</span>
                <strong>{step.name}</strong>
                <em>{step.durationMs} ms</em>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <div className="error">{error}</div> : null}
    </aside>
  );
}
