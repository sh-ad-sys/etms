"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ClipboardList, TrendingUp, Users,
  Clock, LogOut, LucideIcon, CheckCircle,
  ShieldCheck, MapPin, Loader2,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import "@/styles/staff-dashboard.css";

/* ─── Types ─────────────────────────────────────────────── */

interface Task {
  id:       number;
  title:    string;
  deadline: string;
}

interface Notification { title: string; }

interface Stats {
  weekHours:      number;
  tasksCompleted: number;
  totalTasks:     number;
  attendance:     number;
  productivity:   number;
}

interface ApiTask {
  id:          number;
  title:       string;
  description: string;
  created_at:  string;
  completed:   number;
}

interface QRSession {
  success: boolean;
  token:   string;
  expires: string;
}

const BASE = "http://localhost/etms/controllers";

/* ─── Component ─────────────────────────────────────────── */

export default function StaffDashboard() {

  const [tasks,         setTasks]         = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats,         setStats]         = useState<Stats>({
    weekHours: 0, tasksCompleted: 0,
    totalTasks: 0, attendance: 0, productivity: 0,
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [showToast,     setShowToast]     = useState(false);
  const [toastType,     setToastType]     = useState<"success" | "error">("success");

  /* ── QR Session (server-generated, like attendance/qr page) ── */
  const [session,    setSession]    = useState<QRSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown,  setCountdown]  = useState(30);
  const [qrLoading,  setQrLoading]  = useState(true);

  /* ── Geolocation ── */
  const [geoStatus, setGeoStatus] = useState<"checking" | "inside" | "outside" | "unavailable">("checking");

  /* ── Check-in state ── */
  const [verifying,      setVerifying]      = useState(false);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [lastAction,     setLastAction]     = useState<"check_in" | "check_out" | null>(null);
  const [checkInTime,    setCheckInTime]    = useState<string | null>(null);
  const [checkOutTime,   setCheckOutTime]   = useState<string | null>(null);
  const [statusLoading,  setStatusLoading]  = useState(true);

  const toast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setStatusMessage(msg); setToastType(type); setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  }, []);

  /* ── Fetch today's check-in status from server ── */
  const fetchCheckInStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res  = await fetch(`${BASE}/attendance/get-checkin-status.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setLastAction(data.lastAction);
        setCheckInTime(data.checkInTime);
        setCheckOutTime(data.checkOutTime);
      }
    } catch { /* silent */ }
    finally  { setStatusLoading(false); }
  }, []);

  /* ── Fetch QR session from server ── */
  const fetchSession = useCallback(async () => {
    setQrLoading(true);
    try {
      const res  = await fetch(`${BASE}/attendance/generate-session.php`, { credentials: "include" });
      const text = await res.text();
      if (!text.startsWith("{")) throw new Error("Invalid response");
      const data: QRSession = JSON.parse(text);
      if (data.success) setSession(data);
    } catch (e) {
      console.error("QR session error:", e);
    } finally {
      setQrLoading(false);
    }
  }, []);

  /* Auto-refresh QR every 30s */
  useEffect(() => { fetchSession(); }, [fetchSession, refreshKey]);
  useEffect(() => { fetchCheckInStatus(); }, [fetchCheckInStatus]);
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setRefreshKey(k => k + 1); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Geolocation check ── */
  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus("unavailable"); return; }
    const office = { lat: -1.5313, lng: 37.2709 };
    const radiusM = 10000;

    const watcher = navigator.geolocation.watchPosition(
      pos => {
        const R = 6371000;
        const dLat = (pos.coords.latitude  - office.lat) * Math.PI / 180;
        const dLng = (pos.coords.longitude - office.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2
          + Math.cos(office.lat * Math.PI/180)
          * Math.cos(pos.coords.latitude * Math.PI/180)
          * Math.sin(dLng/2)**2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        setGeoStatus(dist <= radiusM ? "inside" : "outside");
      },
      () => setGeoStatus("unavailable"),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  /* ── Fetch dashboard data ── */
  const fetchDashboardData = useCallback(async () => {
    try {
      const [taskRes, notifRes, statsRes] = await Promise.all([
        fetch(`${BASE}/get-tasks.php`,             { credentials: "include" }),
        fetch(`${BASE}/get-notifications.php`,     { credentials: "include" }),
        fetch(`${BASE}/get-staff-dashboard.php`,   { credentials: "include" }),
      ]);

      const [taskData, notifData, statsData] = await Promise.all([
        taskRes.json(), notifRes.json(), statsRes.json(),
      ]);

      if (taskData.success) {
        setTasks(taskData.tasks.map((t: ApiTask) => ({
          id: t.id, title: t.title, deadline: t.created_at,
        })));
      }
      setNotifications(notifData.notifications ?? []);
      if (statsData.stats) setStats(statsData.stats);

    } catch (e) { console.error("Dashboard fetch error", e); }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const id = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(id);
  }, [fetchDashboardData]);

  /* ── Update task ── */
  const updateTaskStatus = async (taskId: number) => {
    try {
      const res    = await fetch(`${BASE}/update-task.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, completed: 1 }),
      });
      const result = await res.json();
      if (result.success) { toast("Task marked complete!"); fetchDashboardData(); }
    } catch { toast("Failed to update task.", "error"); }
  };

  /* ── Confirm attendance (same flow as QR page) ── */
  const confirmPresence = async () => {
    if (!session || verifying) return;
    setVerifying(true);
    try {
      const geo = await new Promise<GeolocationPosition | null>(resolve => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true });
      });

      const res  = await fetch(`${BASE}/attendance/confirm.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token:          session.token,
          lat:            geo?.coords.latitude   ?? null,
          lng:            geo?.coords.longitude  ?? null,
          accuracy:       geo?.coords.accuracy   ?? null,
          distanceMeters: null,
          inside:         geoStatus === "inside",
        }),
      });

      const text = await res.text();
      if (!text.startsWith("{")) throw new Error("Invalid response");
      const data = JSON.parse(text);

      if (data.success) {
        setLastAction(data.action);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        setRefreshKey(k => k + 1);
        fetchCheckInStatus(); // sync button state with server
        toast(data.action === "check_in" ? "Checked in successfully!" : "Checked out successfully!");
      } else {
        toast(data.error || "Attendance failed.", "error");
      }
    } catch { toast("Server error.", "error"); }
    finally  { setVerifying(false); }
  };

  const qrValue = useMemo(() => session?.token ?? "", [session]);

  /* ── Render ── */
  return (
    <div className="staff-dashboard-container">

      {/* HEADER */}
      <div className="staff-header">
        <h1>Royal Mabati Factory</h1>
        <p>Employee Tracking & Management System</p>
      </div>

      {/* STATS */}
      <div className="staff-stats-grid">
        <StatCard icon={Clock}         title="Weekly Hours"     value={`${stats.weekHours}h`} />
        <StatCard icon={ClipboardList} title="Tasks Completed"  value={`${stats.tasksCompleted}/${stats.totalTasks}`} />
        <StatCard icon={TrendingUp}    title="Productivity"     value={`${stats.productivity}%`} />
        <StatCard icon={Users}         title="Attendance"       value={`${stats.attendance}%`} />
      </div>

      <div className="staff-main-grid">

        {/* LEFT — QR Panel */}
        <div className="staff-left-panel">
          <div className="staff-card">
            <h2><ShieldCheck size={16} /> Secure Attendance Verification</h2>

            {/* Geo status pill */}
            <div className={`geo-status geo-${geoStatus}`}>
              <MapPin size={13} />
              {geoStatus === "checking"    && "Checking location..."}
              {geoStatus === "inside"      && "Inside Attendance Zone"}
              {geoStatus === "outside"     && "Outside Allowed Zone"}
              {geoStatus === "unavailable" && "Location unavailable"}
            </div>

            {/* QR Code */}
            <div className="qr-wrapper">
              {qrLoading ? (
                <div className="qr-loader"><Loader2 size={28} className="spin" /></div>
              ) : qrValue ? (
                <>
                  <QRCodeCanvas
                    key={refreshKey}
                    value={qrValue}
                    size={180}
                    level="H"
                    includeMargin
                  />
                  <div className="qr-logo-overlay">
                    <Image src="/logo.jpeg" alt="logo" width={40} height={40} style={{ borderRadius: 8 }} />
                  </div>
                </>
              ) : (
                <div className="qr-error">QR unavailable</div>
              )}
            </div>

            <p className="qr-countdown">
              Refreshing in <strong>{countdown}s</strong>
            </p>

            {/* Confirm button (same as QR page) */}
            <button
              className={`qr-confirm-btn ${verifying ? "loading" : ""} ${lastAction === "check_in" ? "checkout" : "checkin"}`}
              onClick={confirmPresence}
              disabled={verifying || !session || geoStatus === "outside" || statusLoading}
            >
              {statusLoading
                ? <><Loader2 size={15} className="spin" /> Loading...</>
                : verifying
                  ? <><Loader2 size={15} className="spin" /> Verifying...</>
                  : lastAction === "check_in"
                    ? <><LogOut size={15} /> Check Out</>
                    : <><CheckCircle size={15} /> Check In</>
              }
            </button>

            {/* Show today's check-in / check-out times */}
            {(checkInTime || checkOutTime) && (
              <div className="qr-times-row">
                {checkInTime  && <span className="qr-time-in">✓ In {checkInTime}</span>}
                {checkOutTime && <span className="qr-time-out">✓ Out {checkOutTime}</span>}
              </div>
            )}

            {geoStatus === "outside" && (
              <p className="qr-geo-warn">You must be inside the attendance zone to check in.</p>
            )}

            <div className="qr-secure-label">
              <ShieldCheck size={13} /> Secure Verification
            </div>
          </div>
        </div>

        {/* RIGHT — Tasks & Notifications */}
        <div className="staff-right-panel">

          <div className="staff-card">
            <h2><ClipboardList size={15} /> Recent Tasks</h2>
            {tasks.length === 0
              ? <p className="empty">No tasks assigned</p>
              : tasks.map(task => (
                <div key={task.id} className="task-row">
                  <p>{task.title}</p>
                  <span>{new Date(task.deadline).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}</span>
                  <button onClick={() => updateTaskStatus(task.id)}>Complete</button>
                </div>
              ))
            }
          </div>

          <div className="staff-card">
            <h2>Notifications</h2>
            {notifications.length === 0
              ? <p className="empty">No new notifications</p>
              : notifications.map((n, i) => (
                <div key={i} className="notification-row">{n.title}</div>
              ))
            }
          </div>

        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className={`toast toast-${toastType}`}>
          {toastType === "success"
            ? <CheckCircle size={15} />
            : <span style={{ fontSize: 15 }}>⚠</span>
          }
          {statusMessage}
        </div>
      )}

      {/* Success overlay (same as QR page) */}
      {showSuccess && (
        <div className="qr-success-overlay">
          <div className="qr-success-modal">
            <CheckCircle className="qr-success-icon" size={56} />
            <h3>Attendance Recorded</h3>
            <p>{lastAction === "check_in" ? "Checked in successfully" : "Checked out successfully"}</p>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon: Icon, title, value }: {
  icon: LucideIcon; title: string; value: string;
}) {
  return (
    <Card className="stat-card">
      <CardContent className="stat-card-content">
        <Icon size={22} />
        <div><p>{title}</p><h3>{value}</h3></div>
      </CardContent>
    </Card>
  );
}