import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import ChatWindow from "./ChatWindow";
import ProfilePage from "../pages/ProfilePage";
import Sidebar from "./Sidebar";
// import AvatarUpload from "./AvatarUpload";
import { API, request } from "../api/client";
// import "../App.css";

import "./ChatApp.css";
export default function ChatApp({ session, onLogout }) {
  const { token, user } = session;
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatar_url
      ? user.avatar_url.startsWith("http")
        ? user.avatar_url
        : `${API}${user.avatar_url}`
      : ""
  );
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const selectedRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  // Keep the latest selected contact available to the socket handler.
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Load contacts without recreating the function on every render.
  const loadContacts = useCallback(async () => {
    try {
      const data = await request("/api/users", token);
      setContacts(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  // Connect the socket once per authenticated session.
  useEffect(() => {
    let mounted = true;

    const socket = io(API, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (mounted) {
        loadContacts();
      }
    });

    socket.on("new_message", (message) => {
      const active = selectedRef.current;

      const senderId = Number(message.sender_id);
      const receiverId = Number(message.receiver_id);
      const currentUserId = Number(user.id);
      const activeUserId = active ? Number(active.id) : null;

      const isOpenConversation =
        active &&
        ((senderId === currentUserId && receiverId === activeUserId) ||
          (senderId === activeUserId && receiverId === currentUserId));

      if (isOpenConversation) {
        setMessages((current) =>
          current.some((item) => item.id === message.id)
            ? current
            : [...current, message]
        );
      }

      if (mounted) {
        loadContacts();
      }
    });

    socket.on("connect_error", (err) => {
      if (mounted) {
        setError(err.message || "Unable to connect to chat.");
      }
    });

    return () => {
      mounted = false;
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [token, user.id, loadContacts]);

  // Load contacts when the chat screen mounts.
  useEffect(() => {}, [loadContacts]);

  // Load conversation history when a contact is selected.
  useEffect(() => {
    if (!selected) {
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoadingMessages(true);
      setError("");
      setMessages([]);

      try {
        const data = await request(`/api/messages/${selected.id}`, token);

        if (!cancelled) {
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selected, token]);

  // Scroll to the latest message when the conversation changes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text || !selected || sending) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const savedMessage = await request("/api/messages", token, {
        method: "POST",
        body: JSON.stringify({
          receiverId: selected.id,
          content: text,
        }),
      });

      setMessages((current) =>
        current.some((item) => item.id === savedMessage.id)
          ? current
          : [...current, savedMessage]
      );

      setDraft("");
      await loadContacts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const query = search.toLowerCase();

    return (
      (contact.name || "").toLowerCase().includes(query) ||
      (contact.email || "").toLowerCase().includes(query)
    );
  });

  function formatTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (showProfile) {
    return (
      <ProfilePage
        user={user}
        token={token}
        avatarUrl={avatarUrl}
        onAvatarUploaded={(url) => {
          setAvatarUrl(url);

          const updatedUser = {
            ...user,
            avatar_url: url.startsWith(API) ? url.replace(API, "") : url,
          };

          localStorage.setItem("connectly_user", JSON.stringify(updatedUser));
        }}
        onBack={() => setShowProfile(false)}
      />
    );
  }

  return (
    <main className="chat-page">
      <div className="chat-shell">
        <Sidebar
          token={token}
          user={user}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          selected={selected}
          setSelected={setSelected}
          onLogout={onLogout}
          onOpenProfile={() => setShowProfile(true)}
          search={search}
          setSearch={setSearch}
          filteredContacts={filteredContacts}
          setError={setError}
        />
        <ChatWindow
          selected={selected}
          setSelected={setSelected}
          error={error}
          setError={setError}
          loadingMessages={loadingMessages}
          messages={messages}
          user={user}
          bottomRef={bottomRef}
          draft={draft}
          setDraft={setDraft}
          sending={sending}
          sendMessage={sendMessage}
          formatTime={formatTime}
        />
      </div>
    </main>
  );
}
