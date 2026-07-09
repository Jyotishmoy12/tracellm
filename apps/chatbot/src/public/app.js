const messagesElement = document.querySelector("#messages");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const clearButton = document.querySelector("#clear-button");
const providerElement = document.querySelector("#provider");
const modelElement = document.querySelector("#model");
const keyStatusElement = document.querySelector("#key-status");
const errorSimulationStatusElement = document.querySelector("#error-simulation-status");
const traceLLMStatusElement = document.querySelector("#tracellm-status");
const traceLLMKeyStatusElement = document.querySelector("#tracellm-key-status");
const traceLLMEndpointElement = document.querySelector("#tracellm-endpoint");
const traceLLMEventsStatusElement = document.querySelector("#tracellm-events-status");
const traceLLMContentStatusElement = document.querySelector("#tracellm-content-status");
const traceLLMUsageStatusElement = document.querySelector("#tracellm-usage-status");
const traceLLMErrorsStatusElement = document.querySelector("#tracellm-errors-status");
const traceLLMMetadataStatusElement = document.querySelector("#tracellm-metadata-status");
const traceLLMSamplingStatusElement = document.querySelector("#tracellm-sampling-status");
const traceLLMIgnoredSpansStatusElement = document.querySelector("#tracellm-ignored-spans-status");
const traceLLMRedactEmailsStatusElement = document.querySelector("#tracellm-redact-emails-status");
const traceLLMRedactKeysStatusElement = document.querySelector("#tracellm-redact-keys-status");

let traceLLMEnabled = false;
let traceLLMEventsEnabled = false;
const messages = [
  {
    role: "assistant",
    content: "Loading chatbot configuration...",
    localOnly: true
  }
];

await loadConfig();
renderMessages();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content) {
    return;
  }

  input.value = "";
  messages.push({ role: "user", content });
  renderMessages();

  sendButton.disabled = true;
  sendButton.textContent = "Sending";

  try {
    const providerMessages = messages
      .filter((message) => !message.localOnly && (message.role === "user" || message.role === "assistant"))
      .map((message) => ({
        role: message.role,
        content: message.content
      }));

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ messages: providerMessages })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error ?? `Request failed with status ${response.status}`);
    }

    messages.push(data.message);
    renderMessages();
  } catch (error) {
    messages.push({
      role: "system",
      content: error instanceof Error ? error.message : "Unexpected chat error",
      localOnly: true
    });
    renderMessages();
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send";
    input.focus();
  }
});

clearButton.addEventListener("click", () => {
  messages.splice(0, messages.length, {
    role: "assistant",
    content: traceLLMEnabled
      ? "Chat cleared. TraceLLM session tracing is still enabled."
      : "Chat cleared. This is still the no-tracing baseline.",
    localOnly: true
  });
  renderMessages();
});

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    providerElement.textContent = config.provider;
    modelElement.textContent = config.model;
    keyStatusElement.textContent = config.hasProviderKey ? "configured" : "missing";
    errorSimulationStatusElement.textContent = config.simulateProviderError ? "enabled" : "disabled";
    traceLLMEnabled = config.traceLLM.enabled;
    traceLLMStatusElement.textContent = config.traceLLM.enabled ? "enabled" : "disabled";
    traceLLMKeyStatusElement.textContent = config.traceLLM.hasApiKey ? "configured" : "missing";
    traceLLMEndpointElement.textContent = config.traceLLM.endpoint;
    traceLLMEventsEnabled = config.traceLLM.recordEvents;
    traceLLMEventsStatusElement.textContent = config.traceLLM.recordEvents ? "enabled" : "disabled";
    renderTracingConfig(config.traceLLM.tracingConfig);
    messages[0].content = config.traceLLM.enabled
      ? `Hi. TraceLLM session tracing is enabled. Each successful request should create one session, one LLM span${
          traceLLMEventsEnabled ? ", and lifecycle events." : "."
        }`
      : "Hi. I am the clean baseline chatbot. Ask me something, and no TraceLLM calls will be made yet.";
  } catch {
    providerElement.textContent = "unavailable";
    modelElement.textContent = "unavailable";
    keyStatusElement.textContent = "unknown";
    errorSimulationStatusElement.textContent = "unknown";
    traceLLMStatusElement.textContent = "unknown";
    traceLLMKeyStatusElement.textContent = "unknown";
    traceLLMEndpointElement.textContent = "unknown";
    traceLLMEventsStatusElement.textContent = "unknown";
    traceLLMContentStatusElement.textContent = "unknown";
    traceLLMUsageStatusElement.textContent = "unknown";
    traceLLMErrorsStatusElement.textContent = "unknown";
    traceLLMMetadataStatusElement.textContent = "unknown";
    traceLLMSamplingStatusElement.textContent = "unknown";
    traceLLMIgnoredSpansStatusElement.textContent = "unknown";
    traceLLMRedactEmailsStatusElement.textContent = "unknown";
    traceLLMRedactKeysStatusElement.textContent = "unknown";
  }
}

function renderTracingConfig(config) {
  if (!config) {
    traceLLMContentStatusElement.textContent = "disabled";
    traceLLMUsageStatusElement.textContent = "disabled";
    traceLLMErrorsStatusElement.textContent = "disabled";
    traceLLMMetadataStatusElement.textContent = "disabled";
    traceLLMSamplingStatusElement.textContent = "disabled";
    traceLLMIgnoredSpansStatusElement.textContent = "none";
    traceLLMRedactEmailsStatusElement.textContent = "disabled";
    traceLLMRedactKeysStatusElement.textContent = "disabled";
    return;
  }

  if (config.error) {
    traceLLMContentStatusElement.textContent = "config error";
    traceLLMUsageStatusElement.textContent = "config error";
    traceLLMErrorsStatusElement.textContent = "config error";
    traceLLMMetadataStatusElement.textContent = "config error";
    traceLLMSamplingStatusElement.textContent = "config error";
    traceLLMIgnoredSpansStatusElement.textContent = "config error";
    traceLLMRedactEmailsStatusElement.textContent = "config error";
    traceLLMRedactKeysStatusElement.textContent = "config error";
    return;
  }

  const capturesContent = config.captureContent || config.captureInputs || config.captureOutputs;
  traceLLMContentStatusElement.textContent = capturesContent ? "enabled" : "disabled";
  traceLLMUsageStatusElement.textContent = config.captureTokenUsage ? "enabled" : "disabled";
  traceLLMErrorsStatusElement.textContent = config.captureErrors ? "enabled" : "disabled";
  traceLLMMetadataStatusElement.textContent = config.captureMetadata ? "enabled" : "disabled";
  traceLLMSamplingStatusElement.textContent = `${Math.round(config.samplingRate * 100)}%`;
  traceLLMIgnoredSpansStatusElement.textContent =
    Array.isArray(config.ignoredSpanKinds) && config.ignoredSpanKinds.length > 0
      ? config.ignoredSpanKinds.join(", ")
      : "none";
  traceLLMRedactEmailsStatusElement.textContent =
    config.redaction?.enabled && config.redaction?.emails ? "enabled" : "disabled";
  traceLLMRedactKeysStatusElement.textContent =
    config.redaction?.enabled && config.redaction?.apiKeys ? "enabled" : "disabled";
}

function renderMessages() {
  messagesElement.replaceChildren(
    ...messages.map((message) => {
      const article = document.createElement("article");
      article.className = `message message--${message.role}`;

      const label = document.createElement("strong");
      label.textContent = message.role;

      const text = document.createElement("p");
      text.textContent = message.content;

      article.append(label, text);
      return article;
    })
  );

  messagesElement.scrollTop = messagesElement.scrollHeight;
}
