"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Circle,
  Clock,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Send,
  User,
} from "lucide-react";

import "@/styles/messages.css";

type Message = {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  sender: string;
  senderRole?: string;
  receiver: string;
  receiverRole?: string;
  counterparty: string;
  counterpartyRole?: string;
  direction: "sent" | "received";
  message: string;
  isRead: boolean;
  time: string;
  rawTime: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
};

type StatusType = "success" | "error" | null;

const API = "http://localhost/etms/controllers/messages";

function StaffMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [messageFilter, setMessageFilter] = useState<"all" | "received" | "sent">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recipientId, setRecipientId] = useState("");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<StatusType>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  const showStatusFeedback = (type: "success" | "error", text: string) => {
    setStatus(type);
    setStatusMessage(text);
    setShowStatus(true);
    window.setTimeout(() => {
      setShowStatus(false);
      setStatus(null);
      setStatusMessage(null);
    }, 2800);
  };

  const fetchContacts = useCallback(async () => {
    const res = await fetch(`${API}/get-contacts.php`, { credentials: "include" });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to load contacts.");
    }

    setContacts(data.contacts || []);
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`${API}/get-messages.php`, { credentials: "include" });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to load messages.");
    }

    setMessages(data.messages || []);
    setUnreadCount(data.unreadCount ?? 0);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchMessages(), fetchContacts()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [fetchContacts, fetchMessages]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSelect = async (msg: Message) => {
    setSelectedId(msg.id);

    if (msg.direction === "received" && !msg.isRead) {
      setMessages((prev) => prev.map((item) => (item.id === msg.id ? { ...item, isRead: true } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await fetch(`${API}/mark-read.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg.id }),
        });
      } catch {
        // Keep optimistic update.
      }
    }
  };

  const handleSend = async () => {
    if (!recipientId) {
      showStatusFeedback("error", "Choose a recipient first.");
      return;
    }

    if (!draft.trim()) {
      showStatusFeedback("error", "Write a message before sending.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API}/send-message.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: recipientId, message: draft.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message.");
      }

      setDraft("");
      showStatusFeedback("success", data.message || "Message sent successfully");
      await fetchMessages();
    } catch (err) {
      showStatusFeedback("error", err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const filtered = useMemo(() => {
    return messages
      .filter((item) => {
        if (messageFilter === "all") return true;
        return item.direction === messageFilter;
      })
      .filter((item) => {
        const term = search.toLowerCase();
        return (
          item.counterparty.toLowerCase().includes(term) ||
          item.message.toLowerCase().includes(term) ||
          (item.counterpartyRole || "").toLowerCase().includes(term)
        );
      });
  }, [messages, messageFilter, search]);

  const selectedMessage = messages.find((item) => item.id === selectedId) || null;
  const selectedRecipient = contacts.find((contact) => contact.id === recipientId) || null;

  return (
    <div className="messages-page" style={{ maxWidth: 1280 }}>
      {showStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="login-status-card animate-scaleIn flex w-[min(92vw,360px)] flex-col items-center justify-center px-8 py-10">
            <div
              className={`login-status-badge ${
                status === "success" ? "bg-[#dbeafe] text-[#1a3a6b]" : "bg-[#fee2e2] text-[#dc2626]"
              }`}
            >
              {status === "success" ? (
                <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
                  <circle className="login-ring" cx="50" cy="50" r="40" />
                  <path className="login-check" d="M32 52 L45 65 L69 39" />
                </svg>
              ) : (
                <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
                  <circle className="login-ring" cx="50" cy="50" r="40" />
                  <line className="login-cross" x1="36" y1="36" x2="64" y2="64" />
                  <line className="login-cross login-cross-second" x1="64" y1="36" x2="36" y2="64" />
                </svg>
              )}
            </div>

            <p
              className={`mt-5 text-center text-2xl font-semibold ${
                status === "success" ? "text-[#1a3a6b]" : "text-[#dc2626]"
              }`}
            >
              {statusMessage}
            </p>
          </div>
        </div>
      )}

      <div className="messages-header" style={{ alignItems: "flex-start" }}>
        <div>
          <h1>
            <Mail size={22} />
            Messages
            {unreadCount > 0 && <span className="messages-unread-badge">{unreadCount}</span>}
          </h1>
          <p style={{ marginTop: 8, color: "#64748b", fontSize: "0.95rem", maxWidth: 780 }}>
            View messages you have received and the ones you have sent. Unread received messages are highlighted in red.
          </p>
        </div>
        <button className="refresh-msg-btn" onClick={fetchAll} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="messages-error">{error}</div>}

      <div className="messages-layout-grid">
        <div className="messages-container" style={{ gridTemplateColumns: "340px 1fr", marginTop: 0 }}>
          <div className="messages-sidebar">
            <div className="message-filter-tabs">
              <button
                className={messageFilter === "all" ? "active" : ""}
                onClick={() => setMessageFilter("all")}
                type="button"
              >
                All
              </button>
              <button
                className={messageFilter === "received" ? "active" : ""}
                onClick={() => setMessageFilter("received")}
                type="button"
              >
                Received
                {unreadCount > 0 && <span className="filter-unread-pill">{unreadCount}</span>}
              </button>
              <button
                className={messageFilter === "sent" ? "active" : ""}
                onClick={() => setMessageFilter("sent")}
                type="button"
              >
                Sent
              </button>
            </div>

            <div className="search-box">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {loading ? (
              <div className="messages-loading">
                <Loader2 size={18} className="spin" /> Loading...
              </div>
            ) : (
              <div className="messages-list">
                {filtered.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-item ${selectedId === msg.id ? "active" : ""} ${
                      msg.direction === "received" && !msg.isRead ? "unread" : ""
                    }`}
                    onClick={() => handleSelect(msg)}
                  >
                    <div className="message-avatar"><User size={17} /></div>
                    <div className="message-info">
                      <div className="message-top">
                        <h4>{msg.counterparty}</h4>
                        {msg.direction === "received" && !msg.isRead && <Circle size={9} className="unread-dot" />}
                      </div>
                      <div className="message-meta-row">
                        <span className={`message-direction ${msg.direction}`}>
                          {msg.direction === "sent" ? "Sent" : "Received"}
                        </span>
                        <span className="message-role-text">{msg.counterpartyRole || "Message"}</span>
                      </div>
                      <p className="msg-preview">{msg.message.length > 58 ? `${msg.message.slice(0, 58)}...` : msg.message}</p>
                      <span className="time"><Clock size={11} /> {msg.time}</span>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && <div className="empty-state">No messages found.</div>}
              </div>
            )}
          </div>

          <div className="messages-content">
            {selectedMessage ? (
              <>
                <div className="content-header">
                  <div className="content-sender-row">
                    <div className="content-avatar"><User size={20} /></div>
                    <div>
                      <h2>{selectedMessage.counterparty}</h2>
                      <span className="content-time"><Clock size={13} /> {selectedMessage.time}</span>
                      <div className="message-meta-row content-meta-row">
                        <span className={`message-direction ${selectedMessage.direction}`}>
                          {selectedMessage.direction === "sent" ? "Sent by you" : "Received"}
                        </span>
                        <span className="message-role-text">{selectedMessage.counterpartyRole || "Message"}</span>
                      </div>
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
                    <span className="inline-unread-number">{unreadCount}</span> unread message{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <section className="comm-compose-card simple-compose-card">
          <div className="simple-compose-head">
            <div>
              <h3>New Message</h3>
              <p>Send a message and it will appear in your sent list immediately after success.</p>
            </div>
          </div>

          <div className="simple-compose-grid">
            <div>
              <label className="comm-label">Recipient</label>
              <select className="comm-select" value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>
                <option value="">Choose a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} - {contact.role}
                    {contact.department ? ` - ${contact.department}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="comm-label">Message</label>
              <textarea
                className="comm-textarea"
                placeholder="Write your message here..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={1200}
              />
            </div>
          </div>

          {selectedRecipient && (
            <div className="comm-recipient-card">
              <div>
                <strong>{selectedRecipient.name}</strong>
                <span>
                  {selectedRecipient.role}
                  {selectedRecipient.department ? ` | ${selectedRecipient.department}` : ""}
                </span>
              </div>
            </div>
          )}

          <div className="comm-compose-footer">
            <span>{draft.trim().length}/1200</span>
            <button className="send-msg-btn" onClick={handleSend} disabled={sending || loading}>
              {sending ? <Loader2 size={15} className="spin" /> : <Send size={15} />} Send
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .messages-layout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 20px;
          align-items: start;
          margin-top: 20px;
        }
        .simple-compose-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 6px 24px rgba(26, 58, 107, 0.08);
          padding: 20px;
          display: grid;
          gap: 16px;
        }
        .simple-compose-head h3 {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 800;
          color: #1a3a6b;
        }
        .simple-compose-head p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .simple-compose-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          align-items: start;
        }
        .messages-unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          margin-left: 10px;
          padding: 0 7px;
          border-radius: 999px;
          background: #dc2626;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(220, 38, 38, 0.28);
        }
        .message-filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .message-filter-tabs button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 999px;
          border: 1px solid #dbe5f1;
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .message-filter-tabs button.active {
          background: #1d4ed8;
          border-color: #1d4ed8;
          color: #fff;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
        }
        .filter-unread-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: #dc2626;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }
        .message-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .message-direction {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .message-direction.sent {
          background: #dbeafe;
          color: #1d4ed8;
        }
        .message-direction.received {
          background: #fee2e2;
          color: #b91c1c;
        }
        .message-role-text {
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
        }
        .content-meta-row {
          margin-top: 8px;
          margin-bottom: 0;
        }
        .inline-unread-number {
          color: #dc2626;
          font-weight: 800;
        }
        .comm-label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 800;
          color: #1a3a6b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .comm-select,
        .comm-textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 14px;
          font: inherit;
          color: #0f172a;
          background: #fff;
          outline: none;
        }
        .comm-textarea {
          min-height: 150px;
          resize: vertical;
        }
        .comm-select:focus,
        .comm-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .comm-recipient-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: linear-gradient(135deg, #eff6ff, #f8fafc);
          padding: 14px;
        }
        .comm-recipient-card strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .comm-recipient-card span {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }
        .send-msg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
        }
        .send-msg-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .comm-compose-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }
        .animate-scaleIn {
          animation: scaleIn 0.32s ease-out forwards;
        }
        .login-status-card {
          pointer-events: none;
        }
        .login-status-badge {
          display: grid;
          place-items: center;
          width: 136px;
          height: 136px;
          border-radius: 9999px;
        }
        .login-status-badge :global(circle),
        .login-status-badge :global(path),
        .login-status-badge :global(line) {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .login-ring {
          stroke-width: 6;
          stroke-dasharray: 252;
          stroke-dashoffset: 252;
          animation: drawRing 1.1s ease-out forwards;
          transform: rotate(-90deg);
          transform-origin: center;
        }
        .login-check {
          stroke-width: 7;
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: drawMark 0.55s ease-out 0.95s forwards;
        }
        .login-cross {
          stroke-width: 7;
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: drawMark 0.26s ease-out 0.75s forwards;
        }
        .login-cross-second {
          animation-delay: 1.02s;
        }
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes drawRing {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawMark {
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (max-width: 1024px) {
          .messages-layout-grid,
          .messages-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StaffMessagesPage;


