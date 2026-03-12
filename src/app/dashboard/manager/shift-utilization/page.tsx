"use client";

import { useEffect, useState, useCallback } from "react";
import "@/styles/shift-utilization.css";
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import {
  Users, Clock, TrendingUp, Factory,
  Download, Loader2, RefreshCw, Calendar,
  AlertCircle, Wifi,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */

type ShiftRow = {
  shift:       string;
  utilization: number;
  checkedIn:   number;
  onTime:      number;
  late:        number;
  idle:        number;
  startTime:   string;
  endTime:     string;
};

type DeptRow  = { name: string; value: number };
type WeekRow  = { day: string; workers: number; utilization: number };

type UtilData = {
  kpis: {
    overallUtilization: number;
    idlePct:            number;
    activeShifts:       number;
    totalWorkers:       number;
    presentToday:       number;
  };
  shiftEfficiency:  ShiftRow[];
  departmentShift:  DeptRow[];
  weeklyTrend:      WeekRow[];
  generatedAt:      string;
  date:             string;
};

const API    = "http://localhost/etms/controllers/manager";
const COLORS = ["#dc2626", "#1a3a6b", "#f59e0b", "#22c55e", "#7c3aed", "#0891b2"];

/* ─── Component ─────────────────────────────────────────── */

export default function ShiftUtilizationPage() {

  const [data,       setData]       = useState<UtilData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [exporting,  setExporting]  = useState(false);
  const [exportFrom, setExportFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [exportTo, setExportTo] = useState(() => new Date().toISOString().split("T")[0]);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/get-shift-utilization.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load shift data.");
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ── Export ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const res  = await fetch(
        `${API}/export-shift-utilization.php?from=${exportFrom}&to=${exportTo}`,
        { credentials: "include" }
      );
      if (!res.ok) { alert("Export failed."); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href  = URL.createObjectURL(blob);
      link.download = `Royal_Mabati_Shift_Utilization_${exportFrom}_to_${exportTo}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { alert("Export failed."); }
    finally  { setExporting(false); }
  };

  /* ── States ── */
  if (loading && !data) return (
    <div className="shift-loading"><Loader2 size={24} className="spin" /> Loading shift analytics...</div>
  );
  if (error) return <div className="shift-error"><AlertCircle size={16} /> {error}</div>;
  if (!data) return null;

  const { kpis, shiftEfficiency, departmentShift, weeklyTrend } = data;

  return (
    <div className="shift-page">

      {/* HEADER */}
      <div className="shift-header">
        <div>
          <h1><Factory size={22} /> Shift Utilization Analytics</h1>
          <p>Royal Mabati Workforce Productivity Monitoring · {data.date}</p>
        </div>
        <div className="shift-header-right">
          <span className="shift-updated"><Wifi size={11} /> Updated {data.generatedAt}</span>
          <button className="shift-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="shift-kpi-grid">
        <div className="shift-kpi-card success">
          <Users size={22} />
          <div><h3>{kpis.overallUtilization}%</h3><p>Overall Shift Utilization</p></div>
          <TrendingUp size={18} className="kpi-trend-icon" />
        </div>
        <div className="shift-kpi-card warning">
          <Clock size={22} />
          <div><h3>{kpis.idlePct}%</h3><p>Idle Workforce Time</p></div>
        </div>
        <div className="shift-kpi-card primary">
          <Factory size={22} />
          <div><h3>{kpis.activeShifts}</h3><p>Active Shifts Today</p></div>
        </div>
        <div className="shift-kpi-card blue">
          <Users size={22} />
          <div>
            <h3>{kpis.presentToday} <span className="kpi-sub">/ {kpis.totalWorkers}</span></h3>
            <p>Workers Present</p>
          </div>
        </div>
      </div>

      {/* MAIN CHARTS */}
      <div className="shift-grid">

        {/* Shift Efficiency Bar Chart */}
        <div className="chart-card">
          <h2>Shift Efficiency Performance</h2>
          {shiftEfficiency.length === 0 ? (
            <div className="shift-chart-empty">No check-ins recorded today</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={shiftEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="shift" tick={{ fontSize: 13, fontWeight: 600 }} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`, "Utilization"]} />
                  <Bar dataKey="utilization" name="Utilization %" fill="#1a3a6b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>

              {/* Shift details table */}
              <div className="shift-detail-table">
                <table>
                  <thead>
                    <tr>
                      <th>Shift</th>
                      <th>Hours</th>
                      <th>Checked In</th>
                      <th>On Time</th>
                      <th>Late</th>
                      <th>Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftEfficiency.map(s => (
                      <tr key={s.shift}>
                        <td><strong>{s.shift}</strong></td>
                        <td className="time-range">{s.startTime} – {s.endTime}</td>
                        <td>{s.checkedIn}</td>
                        <td className="text-green">{s.onTime}</td>
                        <td className="text-amber">{s.late}</td>
                        <td>
                          <div className="util-bar-wrap">
                            <div className="util-bar" style={{ width: `${s.utilization}%` }} />
                            <span>{s.utilization}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Department Distribution Pie */}
        <div className="chart-card">
          <h2>Department Workforce Distribution</h2>
          {departmentShift.length === 0 ? (
            <div className="shift-chart-empty">No department data today</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={departmentShift} dataKey="value" innerRadius={55} outerRadius={100}>
                    {departmentShift.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="dept-legend">
                {departmentShift.map((d, i) => (
                  <span key={d.name} className="dept-legend-item">
                    <span className="dept-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    {d.name}: <strong>{d.value}</strong>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <div className="chart-card">
          <h2><TrendingUp size={16} /> Weekly Utilization Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${v}%`, "Utilization"]} />
              <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="#1a3a6b" strokeWidth={3} dot={{ r: 5, fill: "#1a3a6b" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export Card */}
      <div className="export-card">
        <div className="export-card-left">
          <h3><Download size={16} /> Export Shift Utilization Report</h3>
          <p>Download detailed shift data as Excel spreadsheet (.xls)</p>
        </div>
        <div className="export-controls">
          <div className="export-date-range">
            <Calendar size={13} />
            <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} />
            <span>—</span>
            <input type="date" value={exportTo}   onChange={e => setExportTo(e.target.value)} />
          </div>
          <button className="export-btn" onClick={handleExport} disabled={exporting}>
            {exporting
              ? <><Loader2 size={15} className="spin" /> Exporting...</>
              : <><Download size={15} /> Export Excel</>
            }
          </button>
        </div>
      </div>

    </div>
  );
}