"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, ReactNode } from "react";
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  AlertTriangle, Users, Clock, DollarSign,
  ShieldCheck, BarChart3, FileCheck,
  ClipboardList, LucideIcon, Loader2,
  RefreshCw, Info,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import "@/styles/manager-dashboard.css";

/* â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

type Insight = { type: "up" | "down" | "warning" | "danger" | "info"; message: string };

type DashboardData = {
  kpis: {
    totalWorkforce:   number;
    totalOtHours:     number;
    overtimeCost:     number;
    complianceScore:  number;
    pendingApprovals: number;
  };
  monthlyTrend:       { month: string; attendance: number; productivity: number }[];
  overtimeCostByDept: { dept: string; cost: number }[];
  complianceRisk:     { name: string; value: number }[];
  insights:           Insight[];
  generatedAt:        string;
  date:               string;
};

const API    = "http://localhost/etms/controllers/manager";
const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

const INSIGHT_META = {
  up:      { icon: <TrendingUp   size={14} />, cls: "insight-up"      },
  down:    { icon: <TrendingDown  size={14} />, cls: "insight-down"    },
  warning: { icon: <AlertTriangle size={14} />, cls: "insight-warning" },
  danger:  { icon: <AlertTriangle size={14} />, cls: "insight-danger"  },
  info:    { icon: <Info          size={14} />, cls: "insight-info"    },
};

/* â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function ManagerDashboardPage() {

  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/manager-dashboard.php`, { credentials: "include" });
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

  /* Auto-refresh every 60 seconds */
  useEffect(() => {
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading) return (
    <div className="mgr-loading"><Loader2 size={24} className="spin" /> Loading dashboard...</div>
  );
  if (error) return <div className="mgr-error">{error}</div>;
  if (!data)  return null;

  const { kpis, monthlyTrend, overtimeCostByDept, complianceRisk, insights } = data;

  return (
    <div className="mgr-page space-y-6">

      {/* HEADER */}
      <div className="mgr-header">
        <div>
          <h1><LayoutDashboard size={22} /> Executive Manager Dashboard</h1>
          <p>Strategic workforce intelligence Â· {data.date}</p>
        </div>
        <div className="mgr-header-right">
          <span className="mgr-updated">Updated {data.generatedAt}</span>
          <button className="mgr-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="mgr-kpi-grid">
        <KpiCard icon={Users}      title="Total Workforce"         value={kpis.totalWorkforce.toString()}            color="blue"   />
        <KpiCard icon={Clock}      title="Overtime Hours (Month)"  value={`${kpis.totalOtHours}h`}                  color="amber"  />
        <KpiCard icon={DollarSign} title="Overtime Cost (KES)"     value={`KES ${kpis.overtimeCost.toLocaleString()}`} color="red" />
        <KpiCard icon={ShieldCheck}title="Compliance Score"        value={`${kpis.complianceScore}%`}               color="green"  />
      </div>

      {/* EXECUTIVE INSIGHTS */}
      {insights.length > 0 && (
        <div className="mgr-card mgr-insights-card">
          <h2 className="mgr-section-title"><TrendingUp size={16} /> Executive Insights</h2>
          <ul className="mgr-insights-list">
            {insights.map((ins, i) => (
              <li key={i} className={`mgr-insight-item ${INSIGHT_META[ins.type].cls}`}>
                {INSIGHT_META[ins.type].icon}
                <span>{ins.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PENDING APPROVALS BANNER */}
      {kpis.pendingApprovals > 0 && (
        <Link href="/dashboard/manager/leave-approvals" className="mgr-pending-banner">
          <FileCheck size={18} />
          <span>
            <strong>{kpis.pendingApprovals}</strong> leave request{kpis.pendingApprovals !== 1 ? "s" : ""} approved by supervisor and awaiting your review before HR approval
          </span>
          <span className="mgr-banner-action">Review â†’</span>
        </Link>
      )}

      {/* CHARTS ROW 1 */}
      <div className="mgr-chart-grid">

        <div className="mgr-card mgr-chart-wide">
          <h2 className="mgr-section-title">Productivity vs Attendance Trend</h2>
          {monthlyTrend.length === 0 ? (
            <div className="mgr-chart-empty">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => v != null ? `${v}%` : ""} />
                <Legend />
                <Line dataKey="attendance"   name="Attendance"   stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                <Line dataKey="productivity" name="Productivity"  stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mgr-card">
          <h2 className="mgr-section-title">Compliance Risk Distribution</h2>
          {complianceRisk.every(d => d.value === 0) ? (
            <div className="mgr-chart-empty">No data available</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={complianceRisk} dataKey="value" innerRadius={55} outerRadius={90}>
                    {complianceRisk.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mgr-pie-legend">
                {complianceRisk.map((d, i) => (
                  <span key={d.name} className="mgr-legend-item">
                    <span className="mgr-legend-dot" style={{ background: COLORS[i] }} />
                    {d.name}: <strong>{d.value}</strong>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* OVERTIME COST BY DEPT */}
      <div className="mgr-card">
        <h2 className="mgr-section-title"><DollarSign size={16} /> Overtime Cost by Department (This Month)</h2>
        {overtimeCostByDept.length === 0 ? (
          <div className="mgr-chart-empty">No overtime recorded this month</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={overtimeCostByDept}>
              <XAxis dataKey="dept" />
              <YAxis tickFormatter={v => `KES ${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => v != null ? `KES ${(v as number).toLocaleString()}` : ""} />
              <Bar dataKey="cost" name="Overtime Cost" fill="#1a3a6b" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ACTION SECTIONS */}
      <div className="mgr-actions-grid">

        <Section title="Executive Actions">
          <Action icon={FileCheck}    label="Leave Approvals"       href="/dashboard/manager/leave-approvals"  badge={kpis.pendingApprovals} />
          <Action icon={ClipboardList}label="Disciplinary Confirmations"  href="/dashboard/manager/disciplinary" />
          <Action icon={ShieldCheck}  label="Attendance Exemptions"       href="/dashboard/manager/exemptions" />
        </Section>

        <Section title="Reports & Export">
          <Action icon={BarChart3} label="Monthly Performance Reports"    href="/dashboard/manager/monthly-report" />
          <Action icon={BarChart3} label="Department Comparison Reports"  href="/dashboard/manager/department-report" />
          <Action icon={FileCheck} label="Export PDF / Excel Summaries"   href="/dashboard/manager/export" />
        </Section>

      </div>

    </div>
  );
}

/* â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function KpiCard({ icon: Icon, title, value, color }: {
  icon: LucideIcon; title: string; value: string; color: string;
}) {
  return (
    <div className={`mgr-card mgr-kpi-card mgr-kpi-${color}`}>
      <div className={`mgr-kpi-icon icon-${color}`}><Icon size={20} /></div>
      <div>
        <p className="mgr-kpi-label">{title}</p>
        <h3 className="mgr-kpi-value">{value}</h3>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mgr-card">
      <h2 className="mgr-section-title mb-3">{title}</h2>
      <div className="mgr-action-list">{children}</div>
    </div>
  );
}

function Action({ icon: Icon, label, href, badge }: {
  icon: LucideIcon; label: string; href: string; badge?: number;
}) {
  return (
    <Link href={href} className="mgr-action-item">
      <Icon size={17} />
      <span>{label}</span>
      {badge && badge > 0 && <span className="mgr-action-badge">{badge}</span>}
    </Link>
  );
}
