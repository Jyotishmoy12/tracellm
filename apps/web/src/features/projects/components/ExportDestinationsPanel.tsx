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
import type { ExportDestination } from "../types.js";

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
              headers: parsedHeaders.headers
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
  onDelete,
  onTest,
  isTesting
}: {
  destination: ExportDestination;
  onToggle: () => void;
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
