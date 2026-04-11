"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  User,
  AlertTriangle,
  Megaphone,
  ClipboardList,
  MailCheck,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import "@/styles/topbar.css";
import { API_ENDPOINTS, getAuthHeaders, removeToken } from "@/config/api";

export interface AuthUser {
  id: number;
  employeeCode: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  avatar: string;
  role: string;
}

type FeedType = "notification" | "announcement" | "message";
type NotificationType = "Alert" | "Announcement" | "Task" | "Message";

interface NotificationItem {
  id: string;
  backendId: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: number;
  created_at?: string;
  source: FeedType;
}

interface NotificationsResponse {
  notifications?: Array<{
    id: number;
    title: string;
    message: string;
    type?: NotificationType;
    is_read?: number;
    created_at?: string;
  }>;
}

interface AnnouncementsResponse {
  announcements?: Array<{
    id: number;
    title: string;
    message: string;
    created_at?: string;
  }>;
}

interface MessagesResponse {
  messages?: Array<{
    id: number;
    sender?: string;
    message: string;
    is_read?: number;
    created_at?: string;
  }>;
}

const API = "http://localhost/etms/controllers";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";

  const parsed = new Date(dateStr).getTime();
  if (Number.isNaN(parsed)) return "";

  const diff = Math.floor((Date.now() - parsed) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifIcon({ type }: { type?: NotificationType }) {
  const cls = "notif-type-icon";

  if (type === "Alert") {
    return <AlertTriangle size={14} className={`${cls} icon-alert`} />;
  }

  if (type === "Announcement") {
    return <Megaphone size={14} className={`${cls} icon-announce`} />;
  }

  if (type === "Task") {
    return <ClipboardList size={14} className={`${cls} icon-task`} />;
  }

  if (type === "Message") {
    return <MailCheck size={14} className={`${cls} icon-message`} />;
  }

  return <Bell size={14} className={`${cls} icon-default`} />;
}

function getNotificationRoute(pathname: string): string {
  if (pathname.startsWith("/dashboard/admin")) return "/dashboard/admin/notifications";
  if (pathname.startsWith("/dashboard/hr")) return "/dashboard/hr/notifications";
  if (pathname.startsWith("/dashboard/manager")) return "/dashboard/manager/notifications";
  if (pathname.startsWith("/dashboard/supervisor")) return "/dashboard/supervisor/notifications";
  return "/dashboard/notifications";
}

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetch(API_ENDPOINTS.profile, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.user);
      })
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const [notificationsResult, announcementsResult, messagesResult] = await Promise.allSettled([
        fetch(API_ENDPOINTS.notifications, {
          headers: getAuthHeaders(),
          credentials: "include",
        }).then((r) => r.json() as Promise<NotificationsResponse>),
        fetch(`${API}/announcements.php`, {
          credentials: "include",
        }).then((r) => r.json() as Promise<AnnouncementsResponse>),
        fetch(`${API}/messages.php`, {
          credentials: "include",
        }).then((r) => r.json() as Promise<MessagesResponse>),
      ]);

      const notificationItems =
        notificationsResult.status === "fulfilled"
          ? (notificationsResult.value.notifications ?? []).map((item) => ({
              id: `notification-${item.id}`,
              backendId: item.id,
              title: item.title,
              message: item.message,
              type: item.type ?? "Alert",
              is_read: Number(item.is_read ?? 0),
              created_at: item.created_at,
              source: "notification" as const,
            }))
          : [];

      const announcementItems =
        announcementsResult.status === "fulfilled"
          ? (announcementsResult.value.announcements ?? []).map((item) => ({
              id: `announcement-${item.id}`,
              backendId: item.id,
              title: item.title,
              message: item.message,
              type: "Announcement" as const,
              is_read: 1,
              created_at: item.created_at,
              source: "announcement" as const,
            }))
          : [];

      const messageItems =
        messagesResult.status === "fulfilled"
          ? (messagesResult.value.messages ?? []).map((item) => ({
              id: `message-${item.id}`,
              backendId: item.id,
              title: `Message from ${item.sender || "Team"}`,
              message: item.message,
              type: "Message" as const,
              is_read: Number(item.is_read ?? 0),
              created_at: item.created_at,
              source: "message" as const,
            }))
          : [];

      const merged = [...notificationItems, ...announcementItems, ...messageItems].sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });

      setNotifications(merged);
    } catch (err) {
      console.error("Failed to load header notifications:", err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const id = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(id);
  }, [loadNotifications]);

  const markRead = async (item: NotificationItem) => {
    if (item.is_read || item.source === "announcement") return;

    setNotifications((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, is_read: 1 } : entry,
      ),
    );

    try {
      if (item.source === "notification") {
        await fetch(`${API}/mark-notification-read.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.backendId }),
        });
        return;
      }

      await fetch(`${API}/messages/mark-read.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.backendId }),
      });
    } catch (err) {
      console.error("Failed to mark header item read:", err);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setNotifications((prev) =>
      prev.map((item) =>
        item.source === "announcement" ? item : { ...item, is_read: 1 },
      ),
    );

    try {
      await Promise.allSettled([
        fetch(`${API}/mark-all-notifications-read.php`, {
          method: "POST",
          credentials: "include",
        }),
        fetch(`${API}/messages/mark-all-read.php`, {
          method: "POST",
          credentials: "include",
        }),
      ]);
    } finally {
      setMarkingAll(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(API_ENDPOINTS.logout, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      removeToken();
      setDropdownOpen(false);
      router.push("/");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const avatarSrc = user?.avatar ? `http://localhost/etms/${user.avatar}` : null;
  const notificationRoute = getNotificationRoute(pathname);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Image src="/logo.jpeg" alt="ETMS Logo" width={60} height={60} />
        <button className="topbar-icon" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
      </div>

      <div className="topbar-center">
        <h1 className="topbar-title">Employee Tracking &amp; Management System</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-notifications" ref={notifRef}>
          <button
            className={`topbar-icon notif-trigger ${unreadCount > 0 ? "has-unread" : ""}`}
            onClick={() => setNotifOpen((v) => !v)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          >
            <Bell size={20} />
            <span className="topbar-notif-label">Notifications</span>
            {unreadCount > 0 && (
              <span className="topbar-notif-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notification-wrapper">
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <div className="notif-dropdown-title">
                    Notifications
                    {unreadCount > 0 && <span className="notif-header-count">{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={markAllRead} disabled={markingAll}>
                      <CheckCheck size={13} />
                      {markingAll ? "Marking..." : "Mark all read"}
                    </button>
                  )}
                </div>

                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <Bell size={28} />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className={`notif-item ${item.is_read ? "read" : "unread"}`}
                        onClick={() => markRead(item)}
                      >
                        {!item.is_read && <span className="notif-unread-dot" />}
                        <div className="notif-icon-wrap">
                          <NotifIcon type={item.type} />
                        </div>
                        <div className="notif-text">
                          <p className="notif-title">{item.title}</p>
                          <p className="notif-msg">{item.message}</p>
                          {item.created_at && <span className="notif-time">{timeAgo(item.created_at)}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notif-dropdown-footer">
                    <a href={notificationRoute} onClick={() => setNotifOpen(false)}>
                      View all notifications
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar-user" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen((v) => !v)} className="topbar-user-btn">
            <div className="topbar-avatar">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="topbar-avatar-img"
                />
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
                    <Image
                      src={avatarSrc}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="topbar-avatar-img"
                    />
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
              <a href="/dashboard/profile" className="topbar-dropdown-item">
                My Profile
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                className="topbar-dropdown-item logout"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
