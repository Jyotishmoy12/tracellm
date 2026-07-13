import { useEffect, useState } from "react";
import { getConfig, sendChat } from "../api/chatApi.js";
import { ChatComposer } from "../components/ChatComposer.js";
import { DiagnosticsPanel } from "../components/DiagnosticsPanel.js";
import { MessageList } from "../components/MessageList.js";
import type { ChatConfig, ChatMessage, ChatMode, ChatResponse } from "../types.js";

export function ChatPage() {
  const [config, setConfig] = useState<ChatConfig>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("standard");
  const [latest, setLatest] = useState<ChatResponse>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getConfig()
      .then(setConfig)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load config"));
  }, []);

  async function submit() {
    const content = input.trim();
    if (!content || pending) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError(undefined);
    setPending(true);

    try {
      const result = await sendChat(nextMessages, mode);
      setLatest(result);
      setMessages([...nextMessages, result.message]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Chat request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="shell">
      <section className="chat">
        <header>
          <div>
            <span>TraceLLM Test App</span>
            <h1>Provider chatbot baseline</h1>
          </div>
          <button type="button" onClick={() => setMessages([])}>
            Clear
          </button>
        </header>

        <MessageList messages={messages} />
        <ChatComposer
          disabled={pending}
          mode={mode}
          value={input}
          onModeChange={setMode}
          onValueChange={setInput}
          onSubmit={submit}
        />
      </section>

      <DiagnosticsPanel config={config} latest={latest} error={error} />
    </main>
  );
}
