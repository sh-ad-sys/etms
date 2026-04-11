"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import "@/styles/manager-attendance-overview.css";
import {
  Users, Clock, TrendingUp, AlertTriangle,
  Search, RefreshCw, Loader2, Calendar,
  Filter, Wifi,
} from "lucide-react";

/* â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

const API = "http://localhost/etms/controllers/manager";

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  "Present":  "present",
  "Late":     "late",
  "Absent":   "absent",
  "On Leave": "on-leave",
  "Outside":  "outside",
};

/* â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function ManagerAttendanceOverview() {

  const [records,    setRecords]    = useState<AttendanceRecord[]>([]);
  const [summary,    setSummary]    = useState<Summary>({ total:0, present:0, late:0, absent:0, onLeave:0, outside:0 });
  const [departments,setDepartments]= useState<string[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [date,       setDate]       = useState("");
  const [asOf,       setAsOf]       = useState("");

  /* â”€â”€ Fetch â”€â”€ */
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
        setError(data.error || "Failed to load attendance data.");
      }
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Auto-refresh every 60 seconds */
  useEffect(() => {
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* â”€â”€ Client-side search filter â”€â”€ */
  const filtered = useMemo(() =>
    records.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase())
    ),
    [records, search]
  );

  /* â”€â”€ Render â”€â”€ */
  return (
    <div className="manager-overview-container">

      {/* HEADER */}
      <div className="manager-header">
        <div>
          <h1><Calendar size={22} /> Attendance Overview</h1>
          <p>Monitor workforce attendance across departments Â· {date}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="manager-kpi-grid">
        <div className="manager-kpi-card total" onClick={() => setStatusFilter("all")}>
          <Users size={22} />
          <div><span>Total Employees</span><h3>{summary.total}</h3></div>
        </div>
        <div className="manager-kpi-card present" onClick={() => setStatusFilter("present")}>
          <Clock size={22} />
          <div><span>Present Today</span><h3>{summary.present}</h3></div>
        </div>
        <div className="manager-kpi-card late" onClick={() => setStatusFilter("late")}>
          <TrendingUp size={22} />
          <div><span>Late Arrivals</span><h3>{summary.late}</h3></div>
        </div>
        <div className="manager-kpi-card absent" onClick={() => setStatusFilter("absent")}>
          <AlertTriangle size={22} />
          <div><span>Absent</span><h3>{summary.absent}</h3></div>
        </div>
        {summary.onLeave > 0 && (
          <div className="manager-kpi-card on-leave" onClick={() => setStatusFilter("on leave")}>
            <Calendar size={22} />
            <div><span>On Leave</span><h3>{summary.onLeave}</h3></div>
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="manager-controls">
        <div className="manager-search-bar">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search employee or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="manager-filter-box">
          <Filter size={14} />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="manager-filter-box">
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
      {error && <div className="manager-error">{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="manager-loading">
          <Loader2 size={20} className="spin" /> Loading attendance data...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="manager-table-wrapper">
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
              {filtered.map(item => (
                <tr key={item.id} className={`att-row-${STATUS_COLORS[item.status]}`}>
                  <td>
                    <div className="emp-cell">
                      <span className="emp-name">{item.name}</span>
                      {item.employeeCode && (
                        <span className="emp-code">{item.employeeCode}</span>
                      )}
                    </div>
                  </td>
                  <td>{item.department}</td>
                  <td><span className="time-val">{item.checkIn}</span></td>
                  <td><span className="time-val">{item.checkOut}</span></td>
                  <td>
                    <span className={`status-badge ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !error && (
            <div className="manager-empty">No attendance records found.</div>
          )}
        </div>
      )}

    </div>
  );
}
