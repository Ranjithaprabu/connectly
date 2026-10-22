
import {
  MessageCircle,
  Send,
  ArrowLeft,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { API } from "../api/client";
import "./ChatWindow.css";

export default function ChatWindow({
  selected,
  setSelected,
  error,
  setError,
  loadingMessages,
  messages,
  user,
  bottomRef,
  draft,
  setDraft,
  sending,
  sendMessage,
  formatTime,
}) {
  // Build the correct URL for local and remote profile photos.
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return "";

    if (
      avatarUrl.startsWith("http://") ||
      avatarUrl.startsWith("https://") ||
      avatarUrl.startsWith("data:")
    ) {
      return avatarUrl;
    }

    return `${API.replace(/\/$/, "")}/${avatarUrl.replace(/^\//, "")}`;
  };

  return (
    <section
      className={`conversation ${
        selected ? "conversation-visible-mobile" : ""
      }`}
    >
      {selected ? (
        <>
          <header className="conversation-header">
            <button
              type="button"
              className="icon-btn mobile-back"
              onClick={() => setSelected(null)}
              aria-label="Back to contacts"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Contact profile photo */}
            <div className="avatar conversation-avatar">
              {selected.avatar_url ? (
                <img
                  src={getAvatarUrl(selected.avatar_url)}
                  alt={`${selected.name || "Contact"}'s profile`}
                  className="conversation-avatar-image"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                (selected.name || selected.email || "?")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="conversation-user">
              <strong>{selected.name}</strong>
              <span>{selected.email}</span>
            </div>
          </header>

          {error && (
            <div className="chat-alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="message-list">
            {loadingMessages ? (
              <div className="message-status">
                <LoaderCircle className="spin" size={24} />
                <span>Loading conversation...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="conversation-empty">
                <div className="empty-icon">
                  <MessageCircle size={30} />
                </div>

                <h2>Start a conversation</h2>

                <p>
                  Send a message to {selected.name} to get things going.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine =
                  Number(message.sender_id) === Number(user.id);

                return (
                  <div
                    key={message.id}
                    className={`message-row ${
                      isMine ? "message-mine" : "message-theirs"
                    }`}
                  >
                    <div className="message-bubble">
                      <p>{message.content}</p>
                      <span>{formatTime(message.created_at)}</span>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={bottomRef} />
          </div>

          <form className="message-composer" onSubmit={sendMessage}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Message ${selected.name}...`}
              aria-label="Write a message"
              autoComplete="off"
              maxLength={5000}
            />

            <button
              type="submit"
              className="send-btn"
              disabled={!draft.trim() || sending}
              aria-label="Send message"
              title="Send message"
            >
              {sending ? (
                <LoaderCircle className="spin" size={19} />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="welcome-panel">
          <div className="welcome-art">
            <MessageCircle size={48} />
          </div>

          <h2>Your conversations, connected.</h2>

          <p>
            Choose someone from your contacts to start a conversation.
          </p>

          <div className="welcome-features">
            <span>
              <ShieldCheck size={16} />
              Verified accounts
            </span>

            <span>
              <MessageCircle size={16} />
              Real-time messaging
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
