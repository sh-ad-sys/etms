"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  TrendingUp,
  Users,
  MessageSquare,
  Bell,
  Clock,
  LogOut,
  Briefcase,
  LucideIcon,
  CheckCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import "@/styles/staff-dashboard.css";

/* ================= TYPES ================= */

interface Task {
  title: string;
  deadline: string;
}

interface Notification {
  title: string;
}

interface Stats {
  weekHours: number;
  tasksCompleted: number;
  totalTasks: number;
  attendance: number;
  productivity: number;
}

interface ApiTask {
  id: number;
  title: string;
  description: string;
  created_at: string;
  completed: number;
}

/* ================= COMPONENT ================= */

export default function StaffDashboard() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({
    weekHours: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    attendance: 0,
    productivity: 0,
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  /* ================= QR SESSION ================= */

  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [session, setSession] = useState<{
    token: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setRefreshKey((k) => k + 1);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSession({
      token: crypto.randomUUID(),
      timestamp: Date.now(),
    });
  }, [refreshKey]);

  const qrValue = useMemo(() => {
    if (!session) return "";
    return JSON.stringify({
      type: "attendance",
      token: session.token,
      timestamp: session.timestamp,
    });
  }, [session]);

  /* ================= FETCH DASHBOARD DATA ================= */

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        const taskRes = await fetch(
          "http://localhost/etms/controllers/get-tasks.php",
          { credentials: "include" }
        );

        const taskData = await taskRes.json();

        if (taskData.success) {

          const formattedTasks = taskData.tasks.map((t: ApiTask) => ({
            title: t.title,
            deadline: t.created_at,
          }));

          setTasks(formattedTasks);
        }

        const notifRes = await fetch(
          "http://localhost/etms/controllers/get-notifications.php",
          { credentials: "include" }
        );

        const notifData = await notifRes.json();
        setNotifications(notifData.notifications ?? []);

        const statsRes = await fetch(
          "http://localhost/etms/controllers/get-staff-dashboard.php",
          { credentials: "include" }
        );

        const statsData = await statsRes.json();
        setStats(statsData.stats ?? stats);

      } catch (err) {
        console.error("Dashboard fetch error", err);
      }

    };

    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);

  }, []);

  /* ================= TASK STATUS UPDATE ================= */

  const updateTaskStatus = async (taskId: number, completed: number) => {

    try {

      const res = await fetch(
        "http://localhost/etms/controllers/update-task.php",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: taskId,
            completed
          })
        }
      );

      const result = await res.json();

      if (result.success) {
        setStatusMessage("Task updated successfully");
        setShowToast(true);

        setTimeout(() => setShowToast(false), 3000);

        /* Refresh dashboard tasks */
        const taskRes = await fetch(
          "http://localhost/etms/controllers/get-tasks.php",
          { credentials: "include" }
        );

        const taskData = await taskRes.json();

        if (taskData.success) {
          setTasks(
            taskData.tasks.map((t: ApiTask) => ({
              title: t.title,
              deadline: t.created_at,
            }))
          );
        }
      }

    } catch (err) {
      console.error(err);
    }

  };

  /* ================= CHECK IN / OUT ================= */

  const handleCheckIn = async () => {

    await fetch("http://localhost/etms/controllers/check-in.php", {
      method: "POST",
      credentials: "include"
    });

    setStatusMessage(`Checked IN at ${new Date().toLocaleTimeString()}`);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCheckOut = async () => {

    await fetch("http://localhost/etms/controllers/check-out.php", {
      method: "POST",
      credentials: "include"
    });

    setStatusMessage(`Checked OUT at ${new Date().toLocaleTimeString()}`);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 3000);
  };

  /* ================= UI ================= */

  return (
    <div className="staff-dashboard-container">

      <div className="staff-header">
        <h1>Royal Mabati Factory</h1>
        <p>Employee Tracking & Management System</p>
      </div>

      {/* STATS */}
      <div className="staff-stats-grid">
        <StatCard icon={Clock} title="Weekly Hours" value={`${stats.weekHours}h`} />
        <StatCard icon={ClipboardList} title="Tasks Completed" value={`${stats.tasksCompleted}/${stats.totalTasks}`} />
        <StatCard icon={TrendingUp} title="Productivity" value={`${stats.productivity}%`} />
        <StatCard icon={Users} title="Attendance" value={`${stats.attendance}%`} />
      </div>

      <div className="staff-main-grid">

        {/* LEFT PANEL */}
        <div className="staff-left-panel">

          <div className="staff-card">
            <h2>Secure Attendance Verification</h2>

            <div className="qr-wrapper">
              {qrValue && (
                <QRCodeCanvas
                  key={refreshKey}
                  value={qrValue}
                  size={180}
                  level="H"
                />
              )}

              <div className="qr-logo-overlay">
                <Image src="/logo.jpeg" alt="logo" width={40} height={40} />
              </div>
            </div>

            <p className="qr-countdown">
              Refreshing in <strong>{countdown}s</strong>
            </p>

            <div className="staff-check-buttons">
              <button onClick={handleCheckIn}>Check In</button>

              <button className="danger" onClick={handleCheckOut}>
                <LogOut size={16} /> Check Out
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="staff-right-panel">

          <div className="staff-card">
            <h2>Recent Tasks</h2>

            {tasks.length === 0 && <p className="empty">No tasks assigned</p>}

            {tasks.map((task, index) => (
              <div key={index} className="task-row">
                <p>{task.title}</p>
                <span>{task.deadline}</span>

                <button
                  onClick={() => updateTaskStatus(index, 1)}
                >
                  Complete
                </button>
              </div>
            ))}
          </div>

          <div className="staff-card">
            <h2>Notifications</h2>

            {notifications.map((n, index) => (
              <div key={index} className="notification-row">
                {n.title}
              </div>
            ))}

          </div>

        </div>

      </div>

      {showToast && (
        <div className="toast">
          <CheckCircle size={16} />
          {statusMessage}
        </div>
      )}

    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <Card className="stat-card">
      <CardContent className="stat-card-content">
        <Icon size={22} />
        <div>
          <p>{title}</p>
          <h3>{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}