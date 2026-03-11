"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock, Search, Filter, AlertTriangle,
  CheckCircle, Loader2, RefreshCw,
  AlertCircle, Calendar,
} from "lucide-react";
import "@/styles/late-logs.css";

/* ─── Types ─────────────────────────────────────────────── */

type Status = "Excused" | "Unexcused";
type FilterStatus = "All" | Status;

type LateLog = {
  id:           string;
  name:         string;
  employeeCode: string;
  department:   string;
  date:         string;
  checkIn:      string;
  checkOut:     string | null;
  minutesLate:  number;
  reason:       string;
  status:       Status;
  excused:      boolean;
};

type Summary = { totalToday: number; total: number; excused: number; unexcused: number };

const API = "http://localhost/etms/controllers/supervisor";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Page ─────────────────────────────────────────────── */

export default function LateLogsPage() {

  const [logs,         setLogs]         = useState<LateLog[]>([]);
  const [summary,      setSummary]      = useState<Summary>({ totalToday:0, total:0, excused:0, unexcused:0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [toast,        setToast]        = useState<{ msg: string; type: "success"|"error" }|null>(null);
  const [acting,       setActing]       = useState<string|null>(null);

  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch ── */
  const fetchLogs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({
        status: statusFilter.toLowerCase(),
        from:   dateFrom,
        to:     dateTo,
        search,
      });
      const res  = await fetch(`${API}/get-late-logs.php?${params}`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const data = await res.json();
      if (data.success) { setLogs(data.logs); setSummary(data.summary); }
      else setError(data.error || "Failed to load logs.");
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, [statusFilter, dateFrom, dateTo, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /* ── Excuse toggle ── */
  const handleExcuse = async (log: LateLog) => {
    const newExcused = !log.excused;
    const reason     = newExcused
      ? (prompt("Reason for excusing (optional):") ?? "")
      : "";
    setActing(log.id);
    try {
      const res  = await fetch(`${API}/excuse-late.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: log.id, excused: newExcused, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs(prev => prev.map(l => l.id === log.id
          ? { ...l, excused: newExcused, status: newExcused ? "Excused" : "Unexcused", reason }
          : l
        ));
        setSummary(s => ({
          ...s,
          excused:   newExcused ? s.excused   + 1 : s.excused   - 1,
          unexcused: newExcused ? s.unexcused - 1 : s.unexcused + 1,
        }));
        showToast(data.message, "success");
      } else showToast(data.error || "Failed to update.", "error");
    } catch { showToast("Unable to connect.", "error"); }
    finally  { setActing(null); }
  };

  const filtered = useMemo(() =>
    logs
      .filter(l => statusFilter === "All" || l.status === statusFilter)
      .filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.department.toLowerCase().includes(search.toLowerCase())
      ),
    [logs, statusFilter, search]
  );

  return (
    <div className="late-page">

      {toast && (
        <div className={`late-toast late-toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="late-header">
        <div>
          <h1><Clock size={22}/> Late Arrival Logs</h1>
          <p>Dashboard / Supervisor / Late &amp; Early Logs</p>
        </div>
        <button className="late-refresh-btn" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""}/> Refresh
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="late-kpi">
        <div className="kpi-card kpi-blue">
          <Clock size={20}/>
          <div><h3>{summary.totalToday}</h3><p>Late Today</p></div>
        </div>
        <div className="kpi-card kpi-slate">
          <Filter size={20}/>
          <div><h3>{summary.total}</h3><p>Total Records</p></div>
        </div>
        <div className="kpi-card kpi-green">
          <CheckCircle size={20}/>
          <div><h3>{summary.excused}</h3><p>Excused</p></div>
        </div>
        <div className="kpi-card kpi-red">
          <AlertTriangle size={20}/>
          <div><h3>{summary.unexcused}</h3><p>Unexcused</p></div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="late-controls">
        <div className="search-box">
          <Search size={14}/>
          <input
            placeholder="Search name or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={14}/>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as FilterStatus)}>
            <option value="All">All Status</option>
            <option value="Excused">Excused</option>
            <option value="Unexcused">Unexcused</option>
          </select>
        </div>
        <div className="date-box">
          <Calendar size={14}/>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
          <span className="date-sep">—</span>
          <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}/>
        </div>
      </div>

      {error && <div className="late-error"><AlertCircle size={15}/> {error}</div>}

      {/* TABLE */}
      {loading ? (
        <div className="late-loading"><Loader2 size={20} className="spin"/> Loading logs...</div>
      ) : (
        <div className="late-table-wrapper">
          <table className="late-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Minutes Late</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className={log.excused ? "row-excused" : ""}>
                  <td>
                    <div className="staff-cell">
                      <span className="staff-name">{log.name}</span>
                      {log.employeeCode && <span className="staff-code">{log.employeeCode}</span>}
                    </div>
                  </td>
                  <td>{log.department}</td>
                  <td>{fmt(log.date)}</td>
                  <td>
                    <span className="checkin-time">{log.checkIn}</span>
                    {log.checkOut && <span className="checkout-time"> — {log.checkOut}</span>}
                  </td>
                  <td>
                    <span className={`late-minutes ${
                      log.minutesLate > 30 ? "minutes-high"
                      : log.minutesLate > 15 ? "minutes-mid"
                      : "minutes-low"
                    }`}>
                      {log.minutesLate} min
                    </span>
                  </td>
                  <td>
                    {log.reason
                      ? <span className="reason-text">{log.reason}</span>
                      : <em className="no-reason">No reason</em>
                    }
                  </td>
                  <td>
                    <span className={`status-badge ${log.status.toLowerCase()}`}>
                      {log.excused
                        ? <><CheckCircle size={11}/> Excused</>
                        : <><AlertTriangle size={11}/> Unexcused</>
                      }
                    </span>
                  </td>
                  <td>
                    <button
                      className={`excuse-btn ${log.excused ? "btn-unexcuse" : "btn-excuse"}`}
                      onClick={() => handleExcuse(log)}
                      disabled={acting === log.id}
                    >
                      {acting === log.id
                        ? <Loader2 size={13} className="spin"/>
                        : log.excused ? "Unexcuse" : "Excuse"
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">No late records found.</div>}
        </div>
      )}

    </div>
  );
}