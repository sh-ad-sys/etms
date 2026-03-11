"use client";

import { useEffect, useState, useCallback } from "react";
import "@/styles/manager-attendance-trends.css";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  Brain, AlertTriangle, Users, Activity,
  TrendingUp, Download, RefreshCw, Loader2,
  CheckCircle2, Building2, Calendar,
} from "lucide-react";

type RiskLevel = "Low" | "Medium" | "High";

type TrendsData = {
  kpis: { totalWorkers: number; livePresent: number; absentToday: number; attendanceRate: number; riskLevel: RiskLevel; };
  weeklyTrend:   { day: string; present: number; late: number; absent: number }[];
  forecastData:  { day: string; risk: number }[];
  deptBreakdown: { dept: string; total: number; present: number; late: number; absent: number }[];
  hourlyFlow:    { time: string; workers: number }[];
  generatedAt:   string;
  date:          string;
};

const API = "http://localhost/etms/controllers/manager";

const RISK_META: Record<RiskLevel, { cls: string; label: string }> = {
  Low:    { cls: "risk-low",    label: "Low Risk"    },
  Medium: { cls: "risk-medium", label: "Medium Risk" },
  High:   { cls: "risk-high",   label: "High Risk"   },
};

export default function AttendanceTrendsPage() {
  const [data,       setData]       = useState<TrendsData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [exporting,  setExporting]  = useState(false);
  const [exportFrom, setExportFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().split("T")[0]; });
  const [exportTo,   setExportTo]   = useState(() => new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/get-attendance-trends.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load trends.");
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { const id = setInterval(fetchData, 30_000); return () => clearInterval(id); }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res  = await fetch(`${API}/export-attendance-excel.php?from=${exportFrom}&to=${exportTo}`, { credentials: "include" });
      if (!res.ok) { alert("Export failed."); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href  = URL.createObjectURL(blob);
      link.download = `Royal_Mabati_Attendance_${exportFrom}_to_${exportTo}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { alert("Export failed."); }
    finally  { setExporting(false); }
  };

  if (loading && !data) return <div className="trends-loading"><Loader2 size={24} className="spin" /> Loading intelligence data...</div>;
  if (error)             return <div className="trends-error">{error}</div>;
  if (!data)             return null;

  const { kpis, weeklyTrend, forecastData, deptBreakdown, hourlyFlow } = data;
  const risk = RISK_META[kpis.riskLevel];

  return (
    <div className="manager-trends-container">

      <div className="manager-trends-header">
        <div>
          <h1>Factory Workforce Intelligence</h1>
          <p>Royal Mabati AI Workforce Monitoring · {data.date}</p>
        </div>
        <div className="trends-header-right">
          <span className="trends-updated"><RefreshCw size={11} /> Updated {data.generatedAt}</span>
          <button className="trends-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className={`kpi-card ai ${risk.cls}`}>
          <Brain size={24} /><div><h3>{risk.label}</h3><p>AI Risk Prediction</p></div>
        </div>
        <div className="kpi-card success">
          <Users size={24} /><div><h3>{kpis.livePresent} <span className="kpi-sub">/ {kpis.totalWorkers}</span></h3><p>Live Workforce Present</p></div>
        </div>
        <div className="kpi-card rate">
          <CheckCircle2 size={24} /><div><h3>{kpis.attendanceRate}%</h3><p>Attendance Rate Today</p></div>
        </div>
        <div className="kpi-card warning">
          <AlertTriangle size={24} /><div><h3>{kpis.absentToday}</h3><p>Absent Today</p></div>
        </div>
      </div>

      <div className="trends-chart-grid">
        <div className="chart-card">
          <h2><Activity size={16} /> Absenteeism Risk Forecast (by Day)</h2>
          {forecastData.every(d => d.risk === 0) ? <div className="chart-empty">Insufficient historical data</div> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 13, fontWeight: 600 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Risk"]} />
                <Line type="monotone" dataKey="risk" name="Risk %" stroke="#dc2626" strokeWidth={3} dot={{ r: 5, fill: "#dc2626" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h2><TrendingUp size={16} /> Weekly Attendance Trend</h2>
          {weeklyTrend.length === 0 ? <div className="chart-empty">No data for this week</div> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Bar dataKey="present" name="Present" fill="#1a3a6b" radius={[4,4,0,0]} />
                <Bar dataKey="late"    name="Late"    fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h2><Building2 size={16} /> Department Attendance Breakdown (Today)</h2>
        {deptBreakdown.length === 0 ? <div className="chart-empty">No department data available</div> : (
          <ResponsiveContainer width="100%" height={Math.max(260, deptBreakdown.length * 45)}>
            <BarChart data={deptBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="dept" type="category" width={130} tick={{ fontSize: 13, fontWeight: 600 }} />
              <Tooltip /><Legend />
              <Bar dataKey="present" name="Present" fill="#1a3a6b" stackId="a" />
              <Bar dataKey="late"    name="Late"    fill="#f59e0b" stackId="a" />
              <Bar dataKey="absent"  name="Absent"  fill="#dc2626" stackId="a" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {hourlyFlow.length > 0 && (
        <div className="chart-card">
          <h2><TrendingUp size={16} /> Live Check-in Flow (Today by Hour)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="workers" name="Check-ins" fill="#2563eb" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="export-card">
        <div className="export-card-left">
          <h3><Download size={16} /> Export Intelligence Report</h3>
          <p>Download attendance data as Excel spreadsheet (.xls)</p>
        </div>
        <div className="export-controls">
          <div className="export-date-range">
            <Calendar size={13} />
            <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} />
            <span>—</span>
            <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} />
          </div>
          <button className="export-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? <><Loader2 size={15} className="spin" /> Exporting...</> : <><Download size={15} /> Export Excel</>}
          </button>
        </div>
      </div>

    </div>
  );
}