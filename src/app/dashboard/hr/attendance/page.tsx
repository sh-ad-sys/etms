"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import "@/styles/hr-attendance.css";
import {
  Users, Clock, AlertTriangle, CheckCircle,
  TrendingUp, Search, Filter, Download,
  Loader2, RefreshCw, Calendar, Wifi,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */

type AttendanceStatus = "Present" | "Late" | "Absent" | "On Leave" | "Outside";

interface AttendanceRecord {
  id:           string;
  name:         string;
  employeeCode: string;
  department:   string;
  checkIn:      string;
  checkOut:     string;
  status:       AttendanceStatus;
}

interface Summary {
  total: number; present: number; late: number;
  absent: number; onLeave: number; outside: number;
}

/* Reuse the manager attendance overview endpoint — same data, HR just sees all roles */
const API = "http://localhost/etms/controllers/manager";

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  "Present":  "present",
  "Late":     "late",
  "Absent":   "absent",
  "On Leave": "on-leave",
  "Outside":  "outside",
};

/* ─── Component ─────────────────────────────────────────── */

export default function HRAttendancePage() {

  const [records,     setRecords]     = useState<AttendanceRecord[]>([]);
  const [summary,     setSummary]     = useState<Summary>({ total:0, present:0, late:0, absent:0, onLeave:0, outside:0 });
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [exporting,   setExporting]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("");
  const [statusFilter,setStatusFilter]= useState("all");
  const [date,        setDate]        = useState("");
  const [asOf,        setAsOf]        = useState("");

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ search, department: deptFilter, status: statusFilter });
      const res    = await fetch(`${API}/get-attendance-overview.php?${params}`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        setSummary(data.summary);
        setDepartments(data.departments || []);
        setDate(data.date);
        setAsOf(data.asOf);
      } else {
        setError(data.error || "Failed to load attendance.");
      }
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, [search, deptFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ── Export ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res   = await fetch(
        `http://localhost/etms/controllers/manager/export-attendance-excel.php?from=${today}&to=${today}`,
        { credentials: "include" }
      );
      if (!res.ok) { alert("Export failed."); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href  = URL.createObjectURL(blob);
      link.download = `Royal_Mabati_Attendance_${today}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { alert("Export failed."); }
    finally  { setExporting(false); }
  };

  /* ── Client search ── */
  const filtered = useMemo(() =>
    records.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase())
    ),
    [records, search]
  );

  const attendanceRate = summary.total > 0
    ? Math.round(((summary.present + summary.late) / summary.total) * 100)
    : 0;

  /* ── Render ── */
  return (
    <div className="hr-attendance-container">

      {/* HEADER */}
      <div className="hr-attendance-header">
        <div>
          <h1><Calendar size={22} /> HR Attendance Monitoring</h1>
          <p>Royal Mabati Factory Workforce Tracking · {date}</p>
        </div>
        <div className="hr-att-header-right">
          {asOf && (
            <span className="hr-att-updated"><Wifi size={11} /> Updated {asOf}</span>
          )}
          <button className="hr-att-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
          <button className="hr-att-export-btn" onClick={handleExport} disabled={exporting}>
            {exporting
              ? <><Loader2 size={14} className="spin" /> Exporting...</>
              : <><Download size={14} /> Export Excel</>
            }
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="attendance-kpi-grid">
        <div className="attendance-kpi-card total" onClick={() => setStatusFilter("all")}>
          <Users size={22} />
          <div><h3>{summary.total}</h3><p>Total Staff</p></div>
        </div>
        <div className="attendance-kpi-card success" onClick={() => setStatusFilter("present")}>
          <CheckCircle size={22} />
          <div><h3>{summary.present}</h3><p>Present Today</p></div>
        </div>
        <div className="attendance-kpi-card warning" onClick={() => setStatusFilter("late")}>
          <Clock size={22} />
          <div><h3>{summary.late}</h3><p>Late Arrivals</p></div>
        </div>
        <div className="attendance-kpi-card danger" onClick={() => setStatusFilter("absent")}>
          <AlertTriangle size={22} />
          <div><h3>{summary.absent}</h3><p>Absent</p></div>
        </div>
        <div className="attendance-kpi-card blue">
          <TrendingUp size={22} />
          <div><h3>{attendanceRate}%</h3><p>Attendance Rate</p></div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="hr-att-filters">
        <div className="hr-att-search">
          <Search size={14} />
          <input
            placeholder="Search employee, ID or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="hr-att-filter-box">
          <Filter size={13} />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="hr-att-filter-box">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="hr-att-error">{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="hr-att-loading">
          <Loader2 size={20} className="spin" /> Loading attendance data...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="attendance-table-card">
          <h2>Today Workforce Attendance
            <span className="att-count">{filtered.length} records</span>
          </h2>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => (
                <tr key={record.id} className={`att-row-${STATUS_COLORS[record.status]}`}>
                  <td>
                    <div className="att-name-cell">
                      <div className="att-avatar">
                        {record.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <span className="att-name">{record.name}</span>
                        {record.employeeCode && (
                          <span className="att-code">{record.employeeCode}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{record.department}</td>
                  <td><span className="att-time">{record.checkIn}</span></td>
                  <td><span className="att-time">{record.checkOut}</span></td>
                  <td>
                    <span className={`status ${STATUS_COLORS[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !error && (
            <div className="att-empty">No attendance records found.</div>
          )}
        </div>
      )}

    </div>
  );
}