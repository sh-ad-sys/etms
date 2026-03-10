"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Mail,
  Search,
  User,
  Clock,
  Circle,
  Loader2,
  RefreshCw,
  Inbox,
} from "lucide-react";

import "@/styles/messages.css";

/* ─── Types ─────────────────────────────────────────────── */

type Message = {
  id:       string;
  threadId: string;
  senderId: string;
  sender:   string;
  message:  string;
  isRead:   boolean;
  time:     string;
  rawTime:  string;
};

const API = "http://localhost/etms/controllers/messages";

/* ─── Component ─────────────────────────────────────────── */

export default function StaffMessagesPage() {

  const [messages,    setMessages]    = useState<Message[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ── Fetch ── */

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/get-messages.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages    || []);
        setUnreadCount(data.unreadCount ?? 0);
      } else {
        setError(data.error || "Failed to load messages.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  /* ── Select + mark as read ── */

  const handleSelect = async (msg: Message) => {
    setSelectedId(msg.id);

    if (!msg.isRead) {
      /* Optimistic update */
      setMessages((prev) =>
        prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m)
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await fetch(`${API}/mark-read.php`, {
          method:      "POST",
          credentials: "include",
          headers:     { "Content-Type": "application/json" },
          body:        JSON.stringify({ id: msg.id }),
        });
      } catch {
        /* silently ignore — will re-read on next fetch */
      }
    }
  };

  /* ── Filter ── */

  const filtered = useMemo(() =>
    messages.filter((m) =>
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())
    ),
    [messages, search]
  );

  const selectedMessage = messages.find((m) => m.id === selectedId);

  /* ── Render ── */

  return (
    <div className="messages-page">

      {/* HEADER */}
      <div className="messages-header">
        <h1>
          <Mail size={22} />
          Staff Messages
          {unreadCount > 0 && (
            <span className="unread-count">{unreadCount}</span>
          )}
        </h1>
        <button
          className="refresh-msg-btn"
          onClick={fetchMessages}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="messages-error">{error}</div>}

      <div className="messages-container">

        {/* LEFT SIDEBAR */}
        <div className="messages-sidebar">

          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="messages-loading">
              <Loader2 size={18} className="spin" /> Loading...
            </div>
          ) : (
            <div className="messages-list">

              {filtered.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${selectedId === msg.id ? "active" : ""} ${!msg.isRead ? "unread" : ""}`}
                  onClick={() => handleSelect(msg)}
                >
                  <div className="message-avatar">
                    <User size={17} />
                  </div>

                  <div className="message-info">
                    <div className="message-top">
                      <h4>{msg.sender}</h4>
                      {!msg.isRead && <Circle size={9} className="unread-dot" />}
                    </div>
                    <p className="msg-preview">
                      {msg.message.length > 55
                        ? msg.message.slice(0, 55) + "…"
                        : msg.message}
                    </p>
                    <span className="time">
                      <Clock size={11} /> {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="empty-state">No messages found.</div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className="messages-content">

          {selectedMessage ? (
            <>
              <div className="content-header">
                <div className="content-sender-row">
                  <div className="content-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <h2>{selectedMessage.sender}</h2>
                    <span className="content-time">
                      <Clock size={13} /> {selectedMessage.time}
                    </span>
                  </div>
                </div>
              </div>

              <div className="content-body">
                <p>{selectedMessage.message}</p>
              </div>
            </>
          ) : (
            <div className="select-message">
              <Inbox size={44} />
              <p>Select a message to read</p>
              {unreadCount > 0 && (
                <span className="select-unread-hint">
                  You have {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}