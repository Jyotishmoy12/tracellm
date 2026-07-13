import type { ChatMessage } from "../types.js";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="messages">
      {messages.length === 0 ? (
        <div className="empty">
          <span>READY</span>
          <h2>Start a provider-backed chat.</h2>
          <p>This baseline app does not use TraceLLM yet.</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
            <span>{message.role}</span>
            <p>{message.content}</p>
          </article>
        ))
      )}
    </div>
  );
}
