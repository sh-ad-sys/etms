"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useMemo, ReactNode } from "react";
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  ClipboardCheck,
  Users,
  Clock,
  FileCheck,
  MessageSquare,
  BellRing,
  ShieldCheck,
  ClipboardList,
  ClipboardPen,
  Loader2,
  RefreshCw,
  LucideIcon,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
} from "recharts";
import "@/styles/supervisor-dashboard.css";

type KPIs = {
  staffPresent:     number;
  lateToday:        number;
  missingCheckins:  number;
  pendingApprovals: number;
};

type AttendanceDay = {
  day:     string;
  present: number;
  late:    number;
  absent:  number;
};

type PunctualitySlice = { name: string; value: number };
type LateTrend        = { week: string; late: number };
type RecentLate       = { name: string; checkIn: string };

type DashboardData = {
  kpis:             KPIs;
  attendanceData:   AttendanceDay[];
  punctualityData:  PunctualitySlice[];
  weeklyLateTrend:  LateTrend[];
  approvalQueue:    { leaveRequests: number };
  recentLate:       RecentLate[];
  generatedAt:      string;
};

type QRSession = {
  success: boolean;
  token: string;
  expires: string;
};

const API = "http://localhost/etms/controllers/supervisor";
const ATTENDANCE_API = "http://localhost/etms/controllers/attendance";
const COLORS = ["#4f46e5", "#f59e0b", "#ef4444", "#64748b"];

export default function SupervisorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [session, setSession] = useState<QRSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [qrLoading, setQrLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState<"checking" | "inside" | "outside" | "unavailable">("checking");
  const [verifying, setVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<"check_in" | "check_out" | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const toast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setStatusMessage(msg);
    setToastType(type);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/supervisor-dashboard.php`, { credentials: "include" });
      if (res.status === 401) {
        setError("Session expired.");
        return;
      }
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load dashboard.");
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCheckInStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`${ATTENDANCE_API}/get-checkin-status.php`, { credentials: "include" });
      const statusData = await res.json();
      if (statusData.success) {
        setLastAction(statusData.lastAction);
        setCheckInTime(statusData.checkInTime);
        setCheckOutTime(statusData.checkOutTime);
      }
    } catch {
      // Keep the button disabled if status sync fails.
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchSession = useCallback(async () => {
    setQrLoading(true);
    try {
      const res = await fetch(`${ATTENDANCE_API}/generate-session.php`, { credentials: "include" });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const text = await res.text();
      
      if (!text || text.trim() === "") {
        throw new Error("Empty response from server");
      }
      
      if (!text.startsWith("{")) {
        throw new Error("Invalid response format");
      }
      
      const qrData: QRSession = JSON.parse(text);
      if (qrData.success && qrData.token) {
        setSession(qrData);
      } else {
        throw new Error(qrData.error || "Failed to generate session");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("QR session error:", errorMsg);
      setSession(null);
    } finally {
      setQrLoading(false);
    }
  }, []);

  const confirmPresence = async () => {
    if (!session || verifying) return;
    setVerifying(true);
    try {
      const geo = await new Promise<GeolocationPosition | null>((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true });
      });

      const res = await fetch(`${ATTENDANCE_API}/confirm.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: session.token,
          lat: geo?.coords.latitude ?? null,
          lng: geo?.coords.longitude ?? null,
          accuracy: geo?.coords.accuracy ?? null,
          distanceMeters: null,
          inside: geoStatus === "inside",
        }),
      });

      const text = await res.text();
      if (!text.startsWith("{")) throw new Error("Invalid response");
      const qrResult = JSON.parse(text);

      if (qrResult.success) {
        setLastAction(qrResult.action);
        setShowSuccess(true);
        window.setTimeout(() => setShowSuccess(false), 2500);
        setRefreshKey((value) => value + 1);
        fetchCheckInStatus();
        fetchData();
        toast(qrResult.action === "check_in" ? "Checked in successfully!" : "Checked out successfully!");
      } else {
        toast(qrResult.error || "Attendance failed.", "error");
      }
    } catch {
      toast("Server error.", "error");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchCheckInStatus();
  }, [fetchCheckInStatus]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession, refreshKey]);

  useEffect(() => {
    const id = window.setInterval(fetchData, 2 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          setRefreshKey((current) => current + 1);
          return 30;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }

    const office = { lat: -1.5313, lng: 37.2709 };
    const radiusM = 10000;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const earthRadius = 6371000;
        const dLat = (pos.coords.latitude - office.lat) * Math.PI / 180;
        const dLng = (pos.coords.longitude - office.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2
          + Math.cos(office.lat * Math.PI / 180)
          * Math.cos(pos.coords.latitude * Math.PI / 180)
          * Math.sin(dLng / 2) ** 2;
        const dist = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setGeoStatus(dist <= radiusM ? "inside" : "outside");
      },
      () => setGeoStatus("unavailable"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const qrValue = useMemo(() => session?.token ?? "", [session]);

  if (loading) {
    return (
      <div className="sup-loading">
        <Loader2 size={24} className="spin" /> Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="sup-error">{error}</div>;
  }

  if (!data) return null;

  const { kpis, punctualityData, approvalQueue, recentLate, generatedAt } = data;

  return (
    <div className="space-y-6">
      <div className="sup-header">
        <div>
          <h1><LayoutDashboard size={22} /> Supervisor Dashboard</h1>
          <p>Real-time oversight of attendance, approvals, and workforce performance.</p>
        </div>
        <button className="sup-refresh-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Staff Present" value={kpis.staffPresent} href="/dashboard/supervisor/attendance-map" color="blue" />
        <StatCard icon={Clock} title="Late Today" value={kpis.lateToday} href="/dashboard/supervisor/late-logs" color="amber" />
        <StatCard icon={ShieldAlert} title="Missing Check-ins" value={kpis.missingCheckins} href="/dashboard/supervisor/missing-checkins" color="red" />
        <StatCard icon={FileCheck} title="Pending Approvals" value={kpis.pendingApprovals} href="/dashboard/supervisor/leave-requests" color="indigo" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div id="qr-checkin" className="dashboard-card sup-qr-card lg:col-span-2">
          <div className="sup-qr-head">
            <div>
              <h2 className="dashboard-section-title sup-qr-title">
                <ShieldCheck size={16} /> Supervisor QR Check-In
              </h2>
              <p className="sup-qr-subtitle">Use the secure QR flow so managers can trace supervisor attendance too.</p>
            </div>
            <span className={`sup-geo-status sup-geo-${geoStatus}`}>
              <MapPin size={13} />
              {geoStatus === "checking" && "Checking location..."}
              {geoStatus === "inside" && "Inside Attendance Zone"}
              {geoStatus === "outside" && "Outside Allowed Zone"}
              {geoStatus === "unavailable" && "Location unavailable"}
            </span>
          </div>

          <div className="sup-qr-shell">
            <div className="sup-qr-wrapper">
              {qrLoading ? (
                <div className="sup-qr-loader"><Loader2 size={28} className="spin" /></div>
              ) : qrValue ? (
                <>
                  <QRCodeCanvas key={refreshKey} value={qrValue} size={180} level="H" includeMargin />
                  <div className="sup-qr-logo-overlay">
                    <Image src="/logo.jpeg" alt="logo" width={40} height={40} style={{ borderRadius: 8 }} />
                  </div>
                </>
              ) : (
                <div className="sup-qr-error">Generating QR...</div>
              )}
            </div>

            <p className="sup-qr-countdown">Refreshing in <strong>{countdown}s</strong></p>

            <button
              className={`sup-qr-confirm-btn ${verifying ? "loading" : ""} ${lastAction === "check_in" ? "checkout" : "checkin"}`}
              onClick={confirmPresence}
              disabled={verifying || !session || geoStatus === "outside" || statusLoading}
            >
              {statusLoading ? (
                <><Loader2 size={15} className="spin" /> Loading...</>
              ) : verifying ? (
                <><Loader2 size={15} className="spin" /> Verifying...</>
              ) : lastAction === "check_in" ? (
                <><LogOut size={15} /> Check Out</>
              ) : (
                <><CheckCircle size={15} /> Check In</>
              )}
            </button>

            {(checkInTime || checkOutTime) && (
              <div className="sup-qr-times-row">
                {checkInTime && <span className="sup-qr-time-in">In {checkInTime}</span>}
                {checkOutTime && <span className="sup-qr-time-out">Out {checkOutTime}</span>}
              </div>
            )}

            {geoStatus === "outside" && (
              <p className="sup-qr-geo-warn">You must be inside the attendance zone to check in.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Punctuality Breakdown</h2>
          {punctualityData.every((entry) => entry.value === 0) ? (
            <div className="chart-empty">No data for today yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={punctualityData} dataKey="value" innerRadius={50} outerRadius={90}>
                  {punctualityData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="pie-legend">
            {punctualityData.map((entry, index) => (
              <span key={entry.name} className="pie-legend-item">
                <span className="pie-dot" style={{ background: COLORS[index % COLORS.length] }} />
                {entry.name}: <strong>{entry.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Supervisor Actions">
            <Action icon={MapPin} label="Live Check-In Map" href="/dashboard/supervisor/attendance-map" />
            <Action icon={ClipboardPen} label="Task Assignment" href="/dashboard/supervisor/task-assignment" />
          </Section>

          {recentLate.length > 0 && (
            <div className="dashboard-card">
              <h2 className="dashboard-section-title">Late Arrivals Today</h2>
              <table className="sup-table">
                <thead>
                  <tr><th>Name</th><th>Check-in</th></tr>
                </thead>
                <tbody>
                  {recentLate.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.name}</td>
                      <td><span className="late-time">{entry.checkIn}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Approval Queue</h2>
            {approvalQueue.leaveRequests > 0 && (
              <div className="approval-queue-banner">
                <span className="approval-queue-badge">{approvalQueue.leaveRequests}</span>
                <span className="approval-queue-text">
                  leave request{approvalQueue.leaveRequests !== 1 ? "s" : ""} pending
                </span>
              </div>
            )}
            <div className="mt-4 space-y-2">
              <Mini icon={FileCheck} label="Leave Approvals" href="/dashboard/supervisor/leave-requests" />
              <Mini icon={Clock} label="Shift Approvals" href="/dashboard/supervisor/shift-approvals" />
              <Mini icon={ShieldCheck} label="ID Verification" href="/dashboard/supervisor/id-verification" />
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Communication</h2>
            <Mini icon={MessageSquare} label="Announcements" href="/dashboard/supervisor/announcements" />
            <Mini icon={BellRing} label="Emergency Alerts" href="/dashboard/supervisor/emergency" />
          </div>
        </div>
      </div>

      {showToast && (
        <div className={`sup-toast sup-toast-${toastType}`}>
          {toastType === "success" ? <CheckCircle size={15} /> : <span className="sup-toast-icon">!</span>}
          {statusMessage}
        </div>
      )}

      {showSuccess && (
        <div className="sup-qr-success-overlay">
          <div className="sup-qr-success-modal">
            <CheckCircle className="sup-qr-success-icon" size={56} />
            <h3>Attendance Recorded</h3>
            <p>{lastAction === "check_in" ? "Checked in successfully" : "Checked out successfully"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, href, color }: {
  icon: LucideIcon; title: string; value: number; href: string; color: string;
}) {
  return (
    <Link href={href} className={`dashboard-card stat-card stat-${color}`}>
      <div className={`stat-icon-box icon-${color}`}><Icon size={20} /></div>
      <div>
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </Link>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-section-title mb-3">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Action({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <Link href={href} className="dashboard-action">
      <Icon size={18} /><span>{label}</span>
    </Link>
  );
}

function Mini({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <Link href={href} className="dashboard-mini-action">
      <Icon size={16} /><span>{label}</span>
    </Link>
  );
}

