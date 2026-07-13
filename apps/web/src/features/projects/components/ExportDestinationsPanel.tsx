import { Activity, FlaskConical, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { webEnv } from "../../../config/env.js";
import { formatDateTime } from "../../../shared/utils/format.js";
import {
  useCreateExportDestination,
  useDeleteExportDestination,
  useExportDestinations,
  useTestExportDestination,
  useUpdateExportDestination
} from "../hooks/useExportDestinations.js";
import type { ExportDestination, ExportDestinationConfig } from "../types.js";

const spanKinds = ["llm", "tool", "retrieval", "agent", "workflow", "custom"];

const defaultExportConfig: ExportDestinationConfig = {
  exportSpans: true,
  exportEvents: true,
  exportErrors: true,
  exportTokenUsage: true,
  exportMetadata: true,
  exportContent: false,
  spanKinds
};

export function ExportDestinationsPanel() {
  const destinationsQuery = useExportDestinations();
  const createDestination = useCreateExportDestination();
  const updateDestination = useUpdateExportDestination();
  const deleteDestination = useDeleteExportDestination();
  const testDestination = useTestExportDestination();
  const destinations = destinationsQuery.data?.data ?? [];

  const [name, setName] = useState("Customer OTLP collector");
  const [endpoint, setEndpoint] = useState(webEnv.defaultOtlpEndpoint);
  const [enabled, setEnabled] = useState(true);
  const [headersText, setHeadersText] = useState("");
  const [config, setConfig] = useState<ExportDestinationConfig>(defaultExportConfig);

  const parsedHeaders = useMemo(() => parseHeaders(headersText), [headersText]);
  const canSubmit = name.trim() && endpoint.trim() && !parsedHeaders.error;

  return (
    <section className="exports-page">
      <div className="exports-layout">
        <form
          className="exports-form panel-box"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) {
              return;
            }
            createDestination.mutate({
              name: name.trim(),
              endpoint: endpoint.trim(),
              enabled,
              headers: parsedHeaders.headers,
              config
            });
          }}
        >
          <p className="eyebrow">External exports</p>
          <h2>Forward traces to your own OTLP backend</h2>
          <p>
            Add a SigNoz, Honeycomb, Tempo, Datadog collector, or any OTLP HTTP
            endpoint. TraceLLM keeps the product timeline and forwards a copy.
          </p>

          <label>
            Destination name
            <input value={name} onChange={(event) => setName(event.currentTarget.value)} />
          </label>
          <label>
            OTLP HTTP endpoint
            <input value={endpoint} onChange={(event) => setEndpoint(event.currentTarget.value)} />
          </label>
          <label>
            Headers
            <textarea
              value={headersText}
              onChange={(event) => setHeadersText(event.currentTarget.value)}
              placeholder={"signoz-ingestion-key=...\nx-honeycomb-team=..."}
              rows={5}
            />
          </label>
          {parsedHeaders.error ? <p className="form-error">{parsedHeaders.error}</p> : null}

          <label className="inline-toggle">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.currentTarget.checked)} />
            Enabled
          </label>

          <ExportPolicyEditor config={config} onChange={setConfig} />

          <button className="primary-button" type="submit" disabled={!canSubmit || createDestination.isPending}>
            <Plus size={16} />
            Add destination
          </button>
        </form>

        <div className="exports-list">
          <div className="panel-box export-help">
            <p className="eyebrow">Endpoint examples</p>
            <code>https://signoz.example.com:4318</code>
            <code>https://api.honeycomb.io</code>
            <code>https://tempo.example.com:4318</code>
          </div>

          {destinationsQuery.isLoading ? <div className="panel-box">Loading export destinations...</div> : null}
          {destinations.length === 0 && !destinationsQuery.isLoading ? (
            <div className="panel-box export-empty">
              <Activity size={24} />
              <strong>No external exports yet</strong>
              <p>Create a destination to forward project traces to a customer-owned collector.</p>
            </div>
          ) : null}

          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onToggle={() =>
                updateDestination.mutate({
                  id: destination.id,
                  input: { enabled: !destination.enabled }
                })
              }
              onConfigChange={(config) =>
                updateDestination.mutate({
                  id: destination.id,
                  input: { config }
                })
              }
              onDelete={() => deleteDestination.mutate(destination.id)}
              onTest={() => testDestination.mutate(destination.id)}
              isTesting={testDestination.isPending}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DestinationCard({
  destination,
  onToggle,
  onConfigChange,
  onDelete,
  onTest,
  isTesting
}: {
  destination: ExportDestination;
  onToggle: () => void;
  onConfigChange: (config: ExportDestinationConfig) => void;
  onDelete: () => void;
  onTest: () => void;
  isTesting: boolean;
}) {
  const headers = Object.keys(destination.headers);

  return (
    <article className="export-card panel-box">
      <div className="export-card__top">
        <div>
          <p className="eyebrow">OTLP HTTP</p>
          <h3>{destination.name}</h3>
          <code>{destination.endpoint}</code>
        </div>
        <span className={`export-status export-status--${destination.lastStatus ?? "untested"}`}>
          {destination.lastStatus ?? "untested"}
        </span>
      </div>

      <div className="export-card__meta">
        <span>{destination.enabled ? "enabled" : "disabled"}</span>
        <span>{destination.lastTestedAt ? `tested ${formatDateTime(destination.lastTestedAt)}` : "never tested"}</span>
      </div>

      {headers.length > 0 ? (
        <div className="export-card__headers">
          {headers.map((key) => (
            <span key={key}>{key}: ********</span>
          ))}
        </div>
      ) : null}

      {destination.lastError ? <p className="form-error">{destination.lastError}</p> : null}

      <ExportPolicyEditor config={destination.config} onChange={onConfigChange} compact />

      <div className="export-card__actions">
        <button className="secondary-button" type="button" onClick={onToggle}>
          {destination.enabled ? "Disable" : "Enable"}
        </button>
        <button className="secondary-button" type="button" onClick={onTest} disabled={isTesting}>
          <FlaskConical size={15} />
          Test trace
        </button>
        <button className="icon-button" type="button" onClick={onDelete} title="Delete destination" aria-label="Delete destination">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

function ExportPolicyEditor({
  config,
  onChange,
  compact = false
}: {
  config: ExportDestinationConfig;
  onChange: (config: ExportDestinationConfig) => void;
  compact?: boolean;
}) {
  function patch(next: Partial<ExportDestinationConfig>) {
    onChange({ ...config, ...next });
  }

  function toggleSpanKind(kind: string) {
    const nextKinds = config.spanKinds.includes(kind)
      ? config.spanKinds.filter((current) => current !== kind)
      : [...config.spanKinds, kind];
    patch({ spanKinds: nextKinds });
  }

  return (
    <div className={compact ? "export-policy export-policy--compact" : "export-policy"}>
      <p className="eyebrow">Export policy</p>
      <div className="export-policy__grid">
        <PolicyToggle label="Spans" checked={config.exportSpans} onChange={(checked) => patch({ exportSpans: checked })} />
        <PolicyToggle label="Events" checked={config.exportEvents} onChange={(checked) => patch({ exportEvents: checked })} />
        <PolicyToggle label="Errors" checked={config.exportErrors} onChange={(checked) => patch({ exportErrors: checked })} />
        <PolicyToggle
          label="Token usage"
          checked={config.exportTokenUsage}
          onChange={(checked) => patch({ exportTokenUsage: checked })}
        />
        <PolicyToggle
          label="Metadata"
          checked={config.exportMetadata}
          onChange={(checked) => patch({ exportMetadata: checked })}
        />
        <PolicyToggle
          label="Prompt/output content"
          checked={config.exportContent}
          onChange={(checked) => patch({ exportContent: checked })}
        />
      </div>

      <p className="eyebrow">Span kinds</p>
      <div className="export-policy__kinds">
        {spanKinds.map((kind) => (
          <label key={kind}>
            <span>{kind}</span>
            <input type="checkbox" checked={config.spanKinds.includes(kind)} onChange={() => toggleSpanKind(kind)} />
          </label>
        ))}
      </div>
    </div>
  );
}

function PolicyToggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
    </label>
  );
}

function parseHeaders(value: string): { headers: Record<string, string>; error?: string } {
  const headers: Record<string, string> = {};
  for (const rawLine of value.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator <= 0) {
      return { headers: {}, error: "Headers must use key=value, one per line." };
    }
    headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { headers };
}
