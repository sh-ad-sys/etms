"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, ReactNode } from "react";
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
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import "@/styles/supervisor-dashboard.css";

/* ─── Types ─────────────────────────────────────────────── */

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

type RecentLate = { name: string; checkIn: string };

type DashboardData = {
  kpis:             KPIs;
  attendanceData:   AttendanceDay[];
  punctualityData:  PunctualitySlice[];
  weeklyLateTrend:  LateTrend[];
  approvalQueue:    { leaveRequests: number };
  recentLate:       RecentLate[];
  generatedAt:      string;
};

const API    = "http://localhost/etms/controllers/supervisor";
const COLORS = ["#4f46e5", "#f59e0b", "#ef4444", "#64748b"];

/* ─── Page ───────────────────────────────────────────────── */

export default function SupervisorDashboardPage() {

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/supervisor-dashboard.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load dashboard.");
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Auto-refresh every 2 minutes */
  useEffect(() => {
    const id = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) return (
    <div className="sup-loading">
      <Loader2 size={24} className="spin" /> Loading dashboard...
    </div>
  );

  if (error) return (
    <div className="sup-error">{error}</div>
  );

  if (!data) return null;

  const { kpis, attendanceData, punctualityData, weeklyLateTrend, approvalQueue, recentLate } = data;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="sup-header">
        <div>
          <h1><LayoutDashboard size={22} /> Supervisor Dashboard</h1>
          <p>Real-time oversight of attendance, approvals, and workforce performance.</p>
        </div>
        <button className="sup-refresh-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users}      title="Staff Present"      value={kpis.staffPresent}     href="/dashboard/supervisor/attendance-map"  color="blue"   />
        <StatCard icon={Clock}      title="Late Today"         value={kpis.lateToday}        href="/dashboard/supervisor/late-logs"        color="amber"  />
        <StatCard icon={ShieldAlert}title="Missing Check-ins"  value={kpis.missingCheckins}  href="/dashboard/supervisor/missing-checkins" color="red"    />
        <StatCard icon={FileCheck}  title="Pending Approvals"  value={kpis.pendingApprovals} href="/dashboard/supervisor/leave-requests"   color="indigo" />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="dashboard-card lg:col-span-2">
          <h2 className="dashboard-section-title">Weekly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" name="Present" fill="#4f46e5" radius={[6,6,0,0]} />
              <Bar dataKey="late"    name="Late"    fill="#f59e0b" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Punctuality Breakdown</h2>
          {punctualityData.every(d => d.value === 0) ? (
            <div className="chart-empty">No data for today yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={punctualityData} dataKey="value" innerRadius={50} outerRadius={90}>
                  {punctualityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div className="pie-legend">
            {punctualityData.map((d, i) => (
              <span key={d.name} className="pie-legend-item">
                <span className="pie-dot" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}: <strong>{d.value}</strong>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* CHARTS ROW 2 + RIGHT PANEL */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2 space-y-6">

          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Late Arrival Trend (4 Weeks)</h2>
            {weeklyLateTrend.length === 0 ? (
              <div className="chart-empty">No late arrivals recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weeklyLateTrend}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="late" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <Section title="Supervisor Actions">
            <Action icon={MapPin}        label="Live Check-In Map"    href="/dashboard/supervisor/attendance-map" />
            <Action icon={ClipboardCheck}label="Correction Requests"  href="/dashboard/supervisor/corrections" />
            <Action icon={ClipboardPen}  label="Task Assignment"      href="/dashboard/supervisor/task-assignment" />
            <Action icon={ClipboardList} label="Compliance Scores"    href="/dashboard/supervisor/compliance" />
          </Section>

          {/* Recent Late Arrivals */}
          {recentLate.length > 0 && (
            <div className="dashboard-card">
              <h2 className="dashboard-section-title">Late Arrivals Today</h2>
              <table className="sup-table">
                <thead>
                  <tr><th>Name</th><th>Check-in</th></tr>
                </thead>
                <tbody>
                  {recentLate.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td><span className="late-time">{r.checkIn}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">

          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Approval Queue</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/supervisor/leave-requests" className="dashboard-alert clickable">
                  {approvalQueue.leaveRequests} leave request{approvalQueue.leaveRequests !== 1 ? "s" : ""} pending
                </Link>
              </li>
            </ul>
            <div className="mt-4 space-y-2">
              <Mini icon={FileCheck}  label="Leave Approvals"  href="/dashboard/supervisor/leave-requests" />
              <Mini icon={Clock}      label="Shift Approvals"  href="/dashboard/supervisor/shift-approvals" />
              <Mini icon={ShieldCheck}label="ID Verification"  href="/dashboard/supervisor/id-verification" />
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Communication</h2>
            <Mini icon={MessageSquare} label="Announcements"    href="/dashboard/supervisor/announcements" />
            <Mini icon={BellRing}      label="Emergency Alerts" href="/dashboard/supervisor/emergency" />
          </div>

        </div>

      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

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