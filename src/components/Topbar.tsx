"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, ChevronDown, Menu, User,
  AlertTriangle, Megaphone, ClipboardList,
  MailCheck, CheckCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "@/styles/topbar.css";

/* ─── Types ─────────────────────────────────────────────── */

export interface AuthUser {
  id:           number;
  employeeCode: string;
  full_name:    string;
  email:        string;
  phone:        string;
  department:   string;
  avatar:       string;
  role:         string;
}

interface Notification {
  id:          number;
  title:       string;
  message:     string;
  type?:       "Alert" | "Announcement" | "Task" | "Message";
  is_read:     number;
  created_at?: string;
}

const API = "http://localhost/etms/controllers";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifIcon({ type }: { type?: string }) {
  const cls = "notif-type-icon";
  if (type === "Alert")        return <AlertTriangle size={14} className={`${cls} icon-alert`} />;
  if (type === "Announcement") return <Megaphone     size={14} className={`${cls} icon-announce`} />;
  if (type === "Task")         return <ClipboardList size={14} className={`${cls} icon-task`} />;
  if (type === "Message")      return <MailCheck     size={14} className={`${cls} icon-message`} />;
  return                              <Bell          size={14} className={`${cls} icon-default`} />;
}

/* ─── Component ─────────────────────────────────────────── */

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {

  const router = useRouter();

  const [user,          setUser]          = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [markingAll,    setMarkingAll]    = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target as Node))    setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch user ── */
  useEffect(() => {
    fetch(`${API}/topbar-user.php`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.user); });
  }, []);

  /* ── Fetch notifications ── */
  const loadNotifications = useCallback(() => {
    fetch(`${API}/notifications.php`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []));
  }, []);

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30_000);
    return () => clearInterval(id);
  }, [loadNotifications]);

  /* ── Mark single read ── */
  const markRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    await fetch(`${API}/mark-notification-read.php`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  /* ── Mark all read ── */
  const markAllRead = async () => {
    setMarkingAll(true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    await fetch(`${API}/mark-all-notifications-read.php`, {
      method: "POST", credentials: "include",
    }).catch(() => {});
    setMarkingAll(false);
  };

  /* ── Logout ── */
  const logout = async () => {
    try {
      await fetch(`${API}/logout.php`, { credentials: "include" });
      setDropdownOpen(false);
      router.push("/");
    } catch (e) { console.error("Logout failed:", e); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const avatarSrc   = user?.avatar ? `http://localhost/etms/${user.avatar}` : null;

  return (
    <header className="topbar">

      {/* LEFT */}
      <div className="topbar-left">
        <Image src="/logo.jpeg" alt="ETMS Logo" width={60} height={60} />
        <button className="topbar-icon" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
      </div>

      {/* CENTER */}
      <div className="topbar-center">
        <h1 className="topbar-title">Employee Tracking &amp; Management System</h1>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        {/* ── NOTIFICATIONS ── */}
        <div className="topbar-notifications" ref={notifRef}>

          <button
            className={`topbar-icon notif-trigger ${unreadCount > 0 ? "has-unread" : ""}`}
            onClick={() => setNotifOpen(v => !v)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="notification-wrapper">
            <div className="notif-dropdown">

              {/* Header */}
              <div className="notif-dropdown-header">
                <div className="notif-dropdown-title">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="notif-header-count">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-btn"
                    onClick={markAllRead}
                    disabled={markingAll}
                  >
                    <CheckCheck size={13} />
                    {markingAll ? "Marking…" : "Mark all read"}
                  </button>
                )}
              </div>

              {/* List */}
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={28} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${n.is_read ? "read" : "unread"}`}
                      onClick={() => !n.is_read && markRead(n.id)}
                    >
                      {!n.is_read && <span className="notif-unread-dot" />}
                      <div className="notif-icon-wrap">
                        <NotifIcon type={n.type} />
                      </div>
                      <div className="notif-text">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-msg">{n.message}</p>
                        {n.created_at && (
                          <span className="notif-time">{timeAgo(n.created_at)}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="notif-dropdown-footer">
                  <a href="/dashboard/notifications" onClick={() => setNotifOpen(false)}>
                    View all notifications →
                  </a>
                </div>
              )}

            </div>
            </div>
          )}
        </div>

        {/* ── USER ── */}
        <div className="topbar-user" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(v => !v)} className="topbar-user-btn">
            <div className="topbar-avatar">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="avatar" width={32} height={32} className="topbar-avatar-img" />
              ) : (
                <User size={16} />
              )}
            </div>
            <span>Hi, {user?.full_name?.split(" ")[0] || "User"}</span>
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-profile">
                <div className="topbar-dropdown-avatar">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt="avatar" width={40} height={40} className="topbar-avatar-img" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="dropdown-name">{user?.full_name}</p>
                  <p className="dropdown-role">{user?.role}</p>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <a href="/dashboard/profile" className="topbar-dropdown-item">My Profile</a>
              <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="topbar-dropdown-item logout">
                Logout
              </a>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}