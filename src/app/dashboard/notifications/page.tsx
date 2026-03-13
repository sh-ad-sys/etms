"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, AlertTriangle, Megaphone,
  ClipboardList, Search, MailCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import "@/styles/notifications.css";

/* ─── Types ─────────────────────────────────────────────── */

type NotificationType = "All" | "Unread" | "Alert" | "Announcement" | "Task" | "Message";

type NotificationItem = {
  id:         string;
  title:      string;
  message:    string;
  type:       "Alert" | "Announcement" | "Task" | "Message";
  priority:   "High" | "Medium" | "Low";
  is_read:    number;
  created_at: string;
};

type BackendNotification = {
  id:         number;
  title:      string;
  message:    string;
  type?:      "Alert" | "Announcement" | "Task";
  priority?:  "High" | "Medium" | "Low";
  is_read?:   number;
  created_at: string;
};

type BackendAnnouncement = {
  id: number; title: string; message: string; created_at: string;
};

type BackendMessage = {
  id: number; sender: string; message: string; is_read?: number; created_at: string;
};

type NotificationsResponse  = { success: boolean; notifications?: BackendNotification[]; error?: string; };
type AnnouncementsResponse  = { success: boolean; announcements?: BackendAnnouncement[]; };
type MessagesResponse       = { success: boolean; messages?: BackendMessage[]; };

/* ─── Component ─────────────────────────────────────────── */

export default function StaffNotificationsPage() {

  const router = useRouter();
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState<NotificationType>("All");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading,       setLoading]       = useState(true);

  /* ── Wrapped in useCallback so the reference is stable ── */
  const fetchAllCommunication = useCallback(async () => {
    try {
      const [notifRes, announceRes, messageRes] = await Promise.all([
        fetch("http://localhost/etms/controllers/notifications.php",  { credentials: "include" }),
        fetch("http://localhost/etms/controllers/announcements.php",  { credentials: "include" }),
        fetch("http://localhost/etms/controllers/messages.php",       { credentials: "include" }),
      ]);

      const notifData:    NotificationsResponse  = await notifRes.json();
      const announceData: AnnouncementsResponse  = await announceRes.json();
      const messageData:  MessagesResponse       = await messageRes.json();

      if (!notifData.success) {
        console.log("Session expired or not logged in");
        router.push("/");
        return;
      }

      const formattedNotifications: NotificationItem[] =
        (notifData.notifications || []).map((n) => ({
          id:         `notif-${n.id}`,
          title:      n.title,
          message:    n.message,
          type:       n.type     ?? "Alert",
          priority:   n.priority ?? "Medium",
          is_read:    n.is_read  ?? 0,
          created_at: n.created_at,
        }));

      const formattedAnnouncements: NotificationItem[] =
        (announceData.announcements || []).map((a) => ({
          id:         `announce-${a.id}`,
          title:      a.title,
          message:    a.message,
          type:       "Announcement" as const,
          priority:   "Medium"       as const,
          is_read:    1,
          created_at: a.created_at,
        }));

      const formattedMessages: NotificationItem[] =
        (messageData.messages || []).map((m) => ({
          id:         `msg-${m.id}`,
          title:      `Message from ${m.sender}`,
          message:    m.message,
          type:       "Message" as const,
          priority:   "Low"     as const,
          is_read:    m.is_read ?? 0,
          created_at: m.created_at,
        }));

      const combined = [
        ...formattedNotifications,
        ...formattedAnnouncements,
        ...formattedMessages,
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(combined);

      /* Log activity — fire-and-forget, don't await */
      fetch("http://localhost/etms/controllers/logs.php", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ action: "VIEW_COMMUNICATION_CENTER" }),
      }).catch(() => {});

    } catch (error) {
      console.error("Communication fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]); /* router is stable from next/navigation — safe dep */

  /* ── useEffect can now safely include fetchAllCommunication ── */
  useEffect(() => {
    fetchAllCommunication();
    const interval = setInterval(fetchAllCommunication, 30_000);
    return () => clearInterval(interval);
  }, [fetchAllCommunication]);

  /* ── Derived values ── */
  const filteredNotifications = notifications
    .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    .filter((n) => {
      if (filter === "All")    return true;
      if (filter === "Unread") return !n.is_read;
      return n.type === filter;
    });

  const total         = notifications.length;
  const unread        = notifications.filter((n) => !n.is_read).length;
  const alerts        = notifications.filter((n) => n.type === "Alert").length;
  const announcements = notifications.filter((n) => n.type === "Announcement").length;

  if (loading) {
    return <div className="notifications-loading">Loading communication data...</div>;
  }

  return (
    <div className="notifications-page">

      {/* HEADER */}
      <div className="notifications-header">
        <h1><Bell size={24} /> Communication Center</h1>
        <p>Dashboard / Staff / Communication</p>
      </div>

      {/* SUMMARY */}
      <div className="notification-summary">
        <div className="summary-card">
          <Bell />
          <div><h3>{total}</h3><p>Total</p></div>
        </div>
        <div className="summary-card unread">
          <MailCheck />
          <div><h3>{unread}</h3><p>Unread</p></div>
        </div>
        <div className="summary-card alert">
          <AlertTriangle />
          <div><h3>{alerts}</h3><p>Alerts</p></div>
        </div>
        <div className="summary-card announcement">
          <Megaphone />
          <div><h3>{announcements}</h3><p>Announcements</p></div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="notification-controls">
        <div className="filter-tabs">
          {(["All", "Unread", "Alert", "Announcement", "Task", "Message"] as NotificationType[]).map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search communication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="notification-list">
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card ${n.is_read ? "read" : "unread"}`}
          >
            <div className="notification-left">
              <div className="notification-icon">
                {n.type === "Alert"        && <AlertTriangle />}
                {n.type === "Announcement" && <Megaphone />}
                {n.type === "Task"         && <ClipboardList />}
                {n.type === "Message"      && <MailCheck />}
              </div>
              <div>
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <span className="timestamp">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="notification-right">
              <span className={`priority ${n.priority.toLowerCase()}`}>
                {n.priority}
              </span>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="empty-state">No communication records found.</div>
        )}
      </div>

    </div>
  );
}