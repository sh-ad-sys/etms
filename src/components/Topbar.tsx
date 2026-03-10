"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "@/styles/topbar.css";

/* ================= TYPES ================= */

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: number;
}

/* ================= COMPONENT ================= */

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {

  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  /* ================= FETCH USER ================= */

  useEffect(() => {
    fetch("http://localhost/etms/controllers/topbar-user.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
      });
  }, []);

  /* ================= FETCH NOTIFICATIONS ================= */

  const loadNotifications = () => {
    fetch("http://localhost/etms/controllers/notifications.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
      });
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ================= MARK NOTIFICATION READ ================= */

  const markRead = async (id: number) => {
    await fetch("http://localhost/etms/controllers/mark-notification-read.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    loadNotifications();
  };

  /* ================= LOGOUT ================= */

  const logout = async () => {
    try {
      await fetch("http://localhost/etms/controllers/logout.php", {
        credentials: "include"
      });

      setDropdownOpen(false);
      router.push("/"); // ✅ Next.js recommended navigation
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="topbar">

      {/* LEFT */}
      <div className="topbar-left">
        <Image
          src="/logo.jpeg"
          alt="ETMS Logo"
          width={60}
          height={60}
        />

        <button className="topbar-icon" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
      </div>

      {/* CENTER */}
      <div className="topbar-center">
        <h1 className="topbar-title">
          Employee Tracking & Management System
        </h1>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        {/* Notifications */}
        <div className="topbar-notifications">
          <button
            className="topbar-icon"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${n.is_read ? "read" : "unread"}`}
                  onClick={() => markRead(n.id)}
                >
                  <p>{n.title}</p>
                  <small>{n.message}</small>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="notif-empty">
                  No notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        <div className="topbar-user">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="topbar-user-btn"
          >
            <span>
              Hi, {user?.full_name || "User"}
            </span>

            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">

              <a
                href="/dashboard/profile"
                className="topbar-dropdown-item"
              >
                Profile
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