"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import "@/styles/hr.css";
import {
  Users, FileText, ShieldCheck, Bell,
  ClipboardCheck, AlertTriangle, Loader2,
  RefreshCw, CreditCard, IdCard, FileWarning,
  CheckCircle2, XCircle, Clock,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  BarChart, Bar, AreaChart, Area,
} from "recharts";

/* ─── Types ─────────────────────────────────────────────── */

type Activity = {
  source:      string;
  title:       string;
  description: string;
  actor:       string;
  time:        string;
};

type HRData = {
  kpis: {
    totalEmployees:  number;
    activeCases:     number;
    violations:      number;
    complianceScore: number;
  };
  attendanceTrend:  { month: string; present: number }[];
  leaveTrend:       { month: string; leave: number }[];
  complianceTrend:  { month: string; score: number }[];
  recentActivity:   Activity[];
  idSummary: {
    active: number; lost: number; suspended: number; pending: number;
    pendingReplacements: number; pendingLostReports: number;
  };
  employmentStatus: Record<string, number>;
  generatedAt:      string;
  date:             string;
};

const API = "http://localhost/etms/controllers/hr";

const activityIcon: Record<string, React.ReactNode> = {
  audit:      <ClipboardCheck size={15} />,
  lost_id:    <AlertTriangle  size={15} />,
  id_replace: <CreditCard     size={15} />,
};

/* ─── Stat Card ─────────────────────────────────────────── */

function StatCard({ icon: Icon, title, value, color }: {
  icon: React.ElementType; title: string;
  value: string | number; color?: string;
}) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} className={`hr-stat-card ${color ?? ""}`}>
      <Icon className="hr-stat-icon" />
      <h4>{title}</h4>
      <p>{value}</p>
    </motion.div>
  );
}

/* ─── Section Card ──────────────────────────────────────── */

function SectionCard({ icon: Icon, title, desc, badge }: {
  icon: React.ElementType; title: string; desc: string; badge?: number;
}) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="hr-card">
      <Icon className="hr-card-icon" />
      <h3>{title}</h3>
      <p>{desc}</p>
      {badge !== undefined && badge > 0 && (
        <span className="hr-card-badge">{badge}</span>
      )}
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */

export default function HRDashboard() {

  const [data,    setData]    = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/hr-dashboard.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load HR data.");
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) return (
    <div className="hr-loading"><Loader2 size={24} className="spin" /> Loading HR data...</div>
  );
  if (error) return <div className="hr-error">{error}</div>;
  if (!data) return null;

  const { kpis, attendanceTrend, leaveTrend, complianceTrend, recentActivity, idSummary, employmentStatus } = data;

  return (
    <div className="hr-dashboard">

      {/* HEADER */}
      <div className="hr-header">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hr-title"
          >
            HR Command Center
          </motion.h1>
          <p className="hr-subtitle">Royal Mabati Factory · {data.date}</p>
        </div>
        <div className="hr-header-right">
          <span className="hr-updated">Updated {data.generatedAt}</span>
          <button className="hr-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="hr-stats-grid">
        <StatCard icon={Users}         title="Total Employees"   value={kpis.totalEmployees}          color="blue"   />
        <StatCard icon={ClipboardCheck}title="Active Cases"      value={kpis.activeCases}             color="amber"  />
        <StatCard icon={AlertTriangle} title="Attendance Violations" value={kpis.violations}          color="red"    />
        <StatCard icon={ShieldCheck}   title="Compliance Score"  value={`${kpis.complianceScore}%`}   color="green"  />
      </div>

      {/* EMPLOYMENT STATUS */}
      <div className="hr-employment-row">
        {Object.entries(employmentStatus).map(([status, count]) => (
          <div key={status} className={`hr-emp-badge emp-${status.toLowerCase()}`}>
            {status === 'ACTIVE'    && <CheckCircle2 size={14} />}
            {status === 'SUSPENDED' && <Clock        size={14} />}
            {status === 'EXITED'    && <XCircle      size={14} />}
            <span>{count} {status.charAt(0) + status.slice(1).toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* TREND GRAPHS */}
      <section className="hr-section">
        <h2>HR Analytics Trends</h2>
        <div className="hr-graphs-grid">

          <div className="hr-chart-card">
            <h3>Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="present" name="Present" stroke="#1a3a6b" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="hr-chart-card">
            <h3>Leave Usage</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="leave" name="Leave Requests" fill="#dc2626" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="hr-chart-card">
            <h3>Compliance Score Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                <Area type="monotone" dataKey="score" name="Compliance %" stroke="#1a3a6b" fill="#dbeafe" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      {/* ID CARD SUMMARY */}
      <section className="hr-section">
        <h2>ID Card Management</h2>
        <div className="hr-id-summary">
          <div className="hr-id-stat id-active">
            <IdCard size={20} />
            <div><h4>{idSummary.active}</h4><p>Active IDs</p></div>
          </div>
          <div className="hr-id-stat id-lost">
            <FileWarning size={20} />
            <div><h4>{idSummary.lost}</h4><p>Lost IDs</p></div>
          </div>
          <div className="hr-id-stat id-suspended">
            <XCircle size={20} />
            <div><h4>{idSummary.suspended}</h4><p>Suspended</p></div>
          </div>
          <div className="hr-id-stat id-pending">
            <Clock size={20} />
            <div><h4>{idSummary.pending}</h4><p>Pending</p></div>
          </div>
        </div>

        <div className="hr-grid" style={{ marginTop: 16 }}>
          <SectionCard
            icon={FileWarning}
            title="Lost ID Reports"
            desc="Review and process lost ID card reports"
            badge={idSummary.pendingLostReports}
          />
          <SectionCard
            icon={CreditCard}
            title="Replacement Requests"
            desc="Pending ID card replacement requests"
            badge={idSummary.pendingReplacements}
          />
          <SectionCard
            icon={IdCard}
            title="ID Issuance Tracking"
            desc="Full ID card issuance and status logs"
          />
        </div>
      </section>

      {/* EMPLOYEE MANAGEMENT */}
      <section className="hr-section">
        <h2>Employee Management</h2>
        <div className="hr-grid">
          <SectionCard icon={Users}        title="Employee Profiles"  desc="Bio, roles, departments and full HR records" />
          <SectionCard icon={ShieldCheck}  title="Employment Status"  desc="Active, suspended and exited monitoring" />
          <SectionCard icon={FileText}     title="Attendance Records" desc="Full attendance history across all roles" />
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="hr-section">
        <h2>Attendance Compliance</h2>
        <div className="hr-grid">
          <SectionCard icon={ShieldCheck}   title="Official Records"  desc="Legal attendance history logs" />
          <SectionCard icon={FileText}      title="Audit Logs"        desc="Track edits, approvals and HR actions" />
          <SectionCard icon={ClipboardCheck}title="Legal Reports"     desc="Generate compliance-ready reports" />
        </div>
      </section>

      {/* RECENT ACTIVITY TIMELINE */}
      <section className="hr-section">
        <h2>Recent HR Activity</h2>
        <div className="hr-timeline">
          {recentActivity.length === 0 ? (
            <p className="hr-timeline-empty">No recent activity.</p>
          ) : recentActivity.map((item, i) => (
            <motion.div key={i} whileHover={{ x: 6 }} className={`hr-timeline-item hr-tl-${item.source}`}>
              <span className="hr-tl-icon">{activityIcon[item.source] ?? <Bell size={15} />}</span>
              <div className="hr-tl-content">
                <strong>{item.title}</strong>
                {item.description && <span>{item.description}</span>}
                {item.actor && <span className="hr-tl-actor">by {item.actor}</span>}
              </div>
              <span className="hr-tl-time">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}