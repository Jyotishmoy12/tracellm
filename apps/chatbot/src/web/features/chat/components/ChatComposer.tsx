import type { FormEvent } from "react";
import type { ChatMode } from "../types.js";

const modes: Array<{ value: ChatMode; label: string }> = [
  { value: "standard", label: "Standard" },
  { value: "workflow", label: "Workflow" },
  { value: "tool", label: "Tool" },
  { value: "retrieval", label: "Retrieval" },
  { value: "agent", label: "Agent" },
  { value: "custom", label: "Custom" }
];

interface ChatComposerProps {
  disabled: boolean;
  mode: ChatMode;
  value: string;
  onModeChange: (mode: ChatMode) => void;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

export function ChatComposer({ disabled, mode, value, onModeChange, onValueChange, onSubmit }: ChatComposerProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="mode-grid" aria-label="Trace test mode">
        {modes.map((item) => (
          <button
            className={item.value === mode ? "mode active" : "mode"}
            key={item.value}
            type="button"
            onClick={() => onModeChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="input-row">
        <textarea
          aria-label="Message"
          disabled={disabled}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          placeholder="Ask something real..."
          value={value}
        />
        <button disabled={disabled || value.trim().length === 0} type="submit">
          Send
        </button>
      </div>
    </form>
  );
}
