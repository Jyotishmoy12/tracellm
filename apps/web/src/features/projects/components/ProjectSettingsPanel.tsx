import { Copy, KeyRound, Plus, Save, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateTime } from "../../../shared/utils/format.js";
import {
  useApiKeys,
  useCreateApiKey,
  useProjectConfig,
  useRevokeApiKey,
  useUpdateProjectConfig
} from "../hooks/useProjectConfig.js";
import type { CreatedApiKey, TracingConfig } from "../types.js";

const spanKinds = ["llm", "tool", "retrieval", "agent", "workflow", "custom"] as const;

type ProjectSettingsPanelSection = "all" | "config" | "apiKeys";

export function ProjectSettingsPanel({ section = "all" }: { section?: ProjectSettingsPanelSection }) {
  const configQuery = useProjectConfig();
  const apiKeysQuery = useApiKeys();
  const updateConfig = useUpdateProjectConfig();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const [draft, setDraft] = useState<TracingConfig | null>(null);
  const [keyName, setKeyName] = useState("SDK key");
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);

  useEffect(() => {
    if (configQuery.data?.tracingConfig) {
      setDraft(configQuery.data.tracingConfig);
    }
  }, [configQuery.data?.tracingConfig]);

  if (configQuery.isLoading || !draft) {
    return <section className="settings-panel">Loading project settings...</section>;
  }

  if (configQuery.isError || !configQuery.data) {
    return <section className="settings-panel">Project settings unavailable.</section>;
  }

  const projectConfig = configQuery.data;

  return (
    <section className="settings-panel">
      <div className="settings-panel__header">
        <div>
          <p className="eyebrow">Project Config</p>
          <h2>{projectConfig.projectName}</h2>
        </div>
        <div className="settings-panel__key">
          <span>API key</span>
          <code>{projectConfig.apiKeyPrefix}...</code>
        </div>
      </div>

      {section === "all" || section === "config" ? (
        <>
          <div className="settings-grid">
            <Toggle
              label="Tracing enabled"
              description="Turns TraceLLM capture on or off for this project key. When off, the SDK should skip creating new trace records."
              checked={draft.enabled}
              onChange={(enabled) => setDraft({ ...draft, enabled })}
            />
            <Toggle
              label="Capture prompt/output content"
              description="Allows storing prompt and response text. Keep this off when you do not want TraceLLM to persist sensitive LLM content."
              checked={draft.captureContent}
              onChange={(captureContent) => setDraft({ ...draft, captureContent })}
            />
            <Toggle
              label="Capture inputs"
              description="Stores request-side content or input fields when content capture is enabled."
              checked={draft.captureInputs}
              onChange={(captureInputs) => setDraft({ ...draft, captureInputs })}
            />
            <Toggle
              label="Capture outputs"
              description="Stores model outputs or response-side content when content capture is enabled."
              checked={draft.captureOutputs}
              onChange={(captureOutputs) => setDraft({ ...draft, captureOutputs })}
            />
            <Toggle
              label="Errors"
              description="Captures exception events, messages, types, stack traces, and attached error metadata."
              checked={draft.captureErrors}
              onChange={(captureErrors) => setDraft({ ...draft, captureErrors })}
            />
            <Toggle
              label="Token usage"
              description="Stores input, output, and total token counts so traces can show usage and cost signals."
              checked={draft.captureTokenUsage}
              onChange={(captureTokenUsage) => setDraft({ ...draft, captureTokenUsage })}
            />
            <Toggle
              label="Metadata"
              description="Stores non-content attributes such as provider, model, latency, status, IDs, and custom SDK metadata."
              checked={draft.captureMetadata}
              onChange={(captureMetadata) => setDraft({ ...draft, captureMetadata })}
            />
            <Toggle
              label="Redact emails"
              description="Masks email addresses before storing captured attributes or content."
              checked={draft.redaction.emails}
              onChange={(emails) => setDraft({ ...draft, redaction: { ...draft.redaction, emails } })}
            />
            <Toggle
              label="Redact API keys"
              description="Masks API keys, bearer tokens, and secret-like strings before they are persisted."
              checked={draft.redaction.apiKeys}
              onChange={(apiKeys) => setDraft({ ...draft, redaction: { ...draft.redaction, apiKeys } })}
            />
          </div>

          <label
            className="range-control config-help"
            data-tooltip="Controls what percentage of SDK sessions should be captured. 0% means no new sessions, 100% means capture every eligible session."
            title="Controls what percentage of SDK sessions should be captured. 0% means no new sessions, 100% means capture every eligible session."
          >
            <span>
              <SlidersHorizontal size={16} />
              Sampling rate
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={draft.samplingRate}
              onChange={(event) => setDraft({ ...draft, samplingRate: Number(event.currentTarget.value) })}
            />
            <strong>{Math.round(draft.samplingRate * 100)}%</strong>
          </label>

          <div className="span-kind-control">
            <div>
              <p className="eyebrow">Ignored Span Kinds</p>
              <h3>Skip selected span categories</h3>
            </div>
            <div className="span-kind-control__options">
              {spanKinds.map((kind) => (
                <Toggle
                  key={kind}
                  label={kind}
                  description={`Skip ${kind} spans when they are emitted by the SDK. Use this to reduce noise from categories you do not want to inspect.`}
                  checked={draft.ignoredSpanKinds.includes(kind)}
                  onChange={(checked) =>
                    setDraft({
                      ...draft,
                      ignoredSpanKinds: checked
                        ? [...draft.ignoredSpanKinds, kind]
                        : draft.ignoredSpanKinds.filter((item) => item !== kind)
                    })
                  }
                />
              ))}
            </div>
          </div>

          <button
            className="primary-button"
            type="button"
            disabled={updateConfig.isPending}
            onClick={() => updateConfig.mutate(draft)}
          >
            <Save size={16} />
            {updateConfig.isPending ? "Saving" : "Save config"}
          </button>
        </>
      ) : null}

      {section === "all" || section === "apiKeys" ? <div className="api-keys-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Secrets</p>
            <h2>API Keys</h2>
          </div>
          <KeyRound size={20} />
        </div>

        {createdKey ? (
          <div className="created-key">
            <span>New key created. Copy it now; it will not be shown again.</span>
            <code>{createdKey.apiKey}</code>
            <button className="icon-button" type="button" onClick={() => void navigator.clipboard.writeText(createdKey.apiKey)} title="Copy new API key" aria-label="Copy new API key">
              <Copy size={16} />
            </button>
          </div>
        ) : null}

        <div className="create-key-row">
          <input value={keyName} onChange={(event) => setKeyName(event.currentTarget.value)} aria-label="New API key name" />
          <button
            className="primary-button"
            type="button"
            disabled={createKey.isPending || keyName.trim().length === 0}
            onClick={() =>
              createKey.mutate(keyName.trim(), {
                onSuccess: (key) => setCreatedKey(key)
              })
            }
          >
            <Plus size={16} />
            Create key
          </button>
        </div>

        <div className="api-key-list">
          {(apiKeysQuery.data?.data ?? []).map((key) => (
            <div className="api-key-row" key={key.id}>
              <div>
                <strong>{key.name}</strong>
                <span>
                  {key.prefix}... {key.isCurrent ? "(current)" : ""}
                </span>
              </div>
              <span>{key.lastUsedAt ? `Last used ${formatDateTime(key.lastUsedAt)}` : `Created ${formatDateTime(key.createdAt)}`}</span>
              <button
                className="icon-button icon-button--danger"
                type="button"
                disabled={key.isCurrent || revokeKey.isPending}
                onClick={() => revokeKey.mutate(key.id)}
                title={key.isCurrent ? "Current key cannot revoke itself" : "Revoke API key"}
                aria-label={key.isCurrent ? "Current key cannot revoke itself" : "Revoke API key"}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div> : null}
    </section>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row config-help" data-tooltip={description} title={description}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
    </label>
  );
}
