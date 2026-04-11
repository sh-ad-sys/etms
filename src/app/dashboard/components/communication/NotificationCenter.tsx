"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  MailCheck,
  Megaphone,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import "@/styles/notifications.css";

type NotificationType = "All" | "Unread" | "Alert" | "Announcement" | "Task" | "Message";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: "Alert" | "Announcement" | "Task" | "Message";
  priority: "High" | "Medium" | "Low";
  is_read: number;
  created_at: string;
};

type ArchitectureItem = {
  title?: string;
  channel?: string;
  audience?: string;
  description: string;
};

type NotificationMeta = {
  title: string;
  breadcrumb: string;
  roleSummary: string;
};

type NotificationCenterProps = {
  title?: string;
  breadcrumb?: string;
  roleSummary?: string;
};

type NotificationsResponse = {
  success: boolean;
  notifications?: Array<Record<string, any>>;
  error?: string;
};

type AnnouncementsResponse = {
  success: boolean;
  announcements?: Array<Record<string, any>>;
};

type MessagesResponse = {
  success: boolean;
  messages?: Array<Record<string, any>>;
};

type ContactsResponse = {
  success: boolean;
  role?: string;
  allowedRoles?: string[];
  notificationMeta?: NotificationMeta;
  architecture?: {
    channels?: ArchitectureItem[];
    routes?: ArchitectureItem[];
  };
};

function NotificationCenter({ title, breadcrumb, roleSummary }: NotificationCenterProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<NotificationType>("All");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLabel, setRoleLabel] = useState("User");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [channels, setChannels] = useState<ArchitectureItem[]>([]);
  const [routes, setRoutes] = useState<ArchitectureItem[]>([]);
  const [meta, setMeta] = useState<NotificationMeta>({
    title: title || "Notifications",
    breadcrumb: breadcrumb || "Dashboard / Notifications",
    roleSummary:
      roleSummary ||
      "Notifications surface role-relevant alerts, reminders, approvals, and organization-wide communication.",
  });

  const fetchAllCommunication = useCallback(async () => {
    try {
      const [notifRes, announceRes, messageRes, contactsRes] = await Promise.all([
        fetch(API_ENDPOINTS.notifications, { headers: getAuthHeaders() }),
        fetch("http://localhost/etms/controllers/announcements.php", { credentials: "include" }),
        fetch("http://localhost/etms/controllers/messages.php", { credentials: "include" }),
        fetch("http://localhost/etms/controllers/messages/get-contacts.php", { credentials: "include" }),
      ]);

      const notifData: NotificationsResponse = await notifRes.json();
      const announceData: AnnouncementsResponse = await announceRes.json();
      const messageData: MessagesResponse = await messageRes.json();
      const contactsData: ContactsResponse = await contactsRes.json();

      if (!notifData.success) {
        router.push("/");
        return;
      }

      const formattedNotifications: NotificationItem[] = (notifData.notifications || []).map((item) => ({
        id: `notif-${item.id}`,
        title: item.title,
        message: item.message,
        type: item.type ?? "Alert",
        priority: item.priority ?? "Medium",
        is_read: item.is_read ?? 0,
        created_at: item.created_at,
      }));

      const formattedAnnouncements: NotificationItem[] = (announceData.announcements || []).map((item) => ({
        id: `announce-${item.id}`,
        title: item.title,
        message: item.message,
        type: "Announcement",
        priority: "Medium",
        is_read: 1,
        created_at: item.created_at,
      }));

      const formattedMessages: NotificationItem[] = (messageData.messages || []).map((item) => ({
        id: `msg-${item.id}`,
        title: `Message from ${item.sender}`,
        message: item.message,
        type: "Message",
        priority: "Low",
        is_read: item.is_read ?? 0,
        created_at: item.created_at,
      }));

      setNotifications(
        [...formattedNotifications, ...formattedAnnouncements, ...formattedMessages].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );

      if (contactsData.success) {
        setRoleLabel(contactsData.role || "User");
        setAllowedRoles(contactsData.allowedRoles || []);
        setChannels(contactsData.architecture?.channels || []);
        setRoutes(contactsData.architecture?.routes || []);
        if (contactsData.notificationMeta) {
          setMeta(contactsData.notificationMeta);
        }
      }
    } catch (error) {
      console.error("Communication fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAllCommunication();
    const intervalId = window.setInterval(fetchAllCommunication, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchAllCommunication]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.message.toLowerCase().includes(search.toLowerCase())
      )
      .filter((item) => {
        if (filter === "All") return true;
        if (filter === "Unread") return !item.is_read;
        return item.type === filter;
      });
  }, [notifications, search, filter]);

  const total = notifications.length;
  const unread = notifications.filter((item) => !item.is_read).length;
  const alerts = notifications.filter((item) => item.type === "Alert").length;
  const announcements = notifications.filter((item) => item.type === "Announcement").length;

  if (loading) {
    return <div className="notifications-loading">Loading communication data...</div>;
  }

  return (
    <div className="notifications-page" style={{ maxWidth: 1120 }}>
      <div className="notifications-header">
        <h1>
          <Bell size={24} /> {meta.title}
          {unread > 0 && <span className="notif-unread-badge">{unread}</span>}
        </h1>
        <p>{meta.breadcrumb}</p>
      </div>

      <div className="comm-hero-grid">
        <div className="comm-hero-card comm-hero-main">
          <div className="comm-hero-head">
            <Network size={20} />
            <div>
              <h3>{roleLabel} Notification Model</h3>
              <p>{meta.roleSummary}</p>
            </div>
          </div>
          <div className="comm-role-row">
            {allowedRoles.map((role) => (
              <span key={role} className="comm-role-pill">
                {role}
              </span>
            ))}
          </div>
          <div className="comm-route-stack">
            {routes.map((route, index) => (
              <div key={`${route.title || route.description}-${index}`} className="comm-mini-card">
                <strong>{route.title}</strong>
                <p>{route.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="comm-hero-card">
          <div className="comm-hero-head">
            <MailCheck size={20} />
            <div>
              <h3>Messages</h3>
              <p>Person-to-person role communication and escalation.</p>
            </div>
          </div>
          <p className="comm-hero-copy">
            Messages are for direct conversation within allowed role paths. If a route is not allowed,
            use the operational chain instead of bypassing it.
          </p>
        </div>

        <div className="comm-hero-card">
          <div className="comm-hero-head">
            <ShieldCheck size={20} />
            <div>
              <h3>Notifications</h3>
              <p>Workflow events, reminders, approvals, alerts, and broadcasts.</p>
            </div>
          </div>
          <p className="comm-hero-copy">
            Notifications should surface role-relevant system activity, while announcements remain broad
            and non-conversational.
          </p>
        </div>
      </div>

      <div className="comm-channel-grid">
        {channels.map((channel, index) => (
          <div key={`${channel.channel || channel.description}-${index}`} className="comm-channel-card">
            <h4>{channel.channel}</h4>
            <span>{channel.audience}</span>
            <p>{channel.description}</p>
          </div>
        ))}
      </div>

      <div className="notification-summary" style={{ marginTop: 18 }}>
        <div className="summary-card">
          <Bell />
          <div>
            <h3>{total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="summary-card unread">
          <MailCheck />
          <div>
            <h3>{unread}</h3>
            <p>Unread</p>
          </div>
        </div>
        <div className="summary-card alert">
          <AlertTriangle />
          <div>
            <h3>{alerts}</h3>
            <p>Alerts</p>
          </div>
        </div>
        <div className="summary-card announcement">
          <Megaphone />
          <div>
            <h3>{announcements}</h3>
            <p>Announcements</p>
          </div>
        </div>
      </div>

      <div className="notification-controls">
        <div className="filter-tabs">
          {(["All", "Unread", "Alert", "Announcement", "Task", "Message"] as NotificationType[]).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search communication..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="notification-list">
        {filteredNotifications.map((item) => (
          <div key={item.id} className={`notification-card ${item.is_read ? "read" : "unread"}`}>
            <div className="notification-left">
              <div className="notification-icon">
                {item.type === "Alert" && <AlertTriangle />}
                {item.type === "Announcement" && <Megaphone />}
                {item.type === "Task" && <ClipboardList />}
                {item.type === "Message" && <MailCheck />}
              </div>
              <div>
                <div className="notif-title-row">
                  <h3>{item.title}</h3>
                  {!item.is_read && <span className="notif-read-pill">Unread</span>}
                </div>
                <p>{item.message}</p>
                <span className="timestamp">{new Date(item.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="notification-right">
              <span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="empty-state">No communication records found.</div>
        )}
      </div>

      <style jsx>{`
        .notif-unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 7px;
          margin-left: 10px;
          border-radius: 999px;
          background: #dc2626;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(220, 38, 38, 0.3);
        }

        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 5px;
        }

        .notif-read-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .comm-hero-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr;
          gap: 16px;
          margin-top: 10px;
        }

        .comm-hero-card,
        .comm-channel-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 6px 24px rgba(26, 58, 107, 0.08);
          padding: 18px;
        }

        .comm-hero-main {
          background: linear-gradient(135deg, #eff6ff, #ffffff);
        }

        .comm-hero-head {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          color: #1a3a6b;
        }

        .comm-hero-head h3 {
          margin: 0 0 4px;
          font-size: 17px;
          font-weight: 800;
        }

        .comm-hero-head p,
        .comm-hero-copy,
        .comm-mini-card p,
        .comm-channel-card p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .comm-role-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .comm-role-pill {
          background: #1a3a6b;
          color: #fff;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .comm-route-stack,
        .comm-channel-grid {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .comm-mini-card {
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 12px 14px;
        }

        .comm-mini-card strong,
        .comm-channel-card h4 {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          color: #0f172a;
        }

        .comm-channel-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .comm-channel-card span {
          display: inline-block;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #2563eb;
        }

        @media (max-width: 1024px) {
          .comm-hero-grid,
          .comm-channel-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export { NotificationCenter };
export default NotificationCenter;
