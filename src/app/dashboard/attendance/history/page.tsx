"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import "../../../../styles/history.css";

interface AttendanceHistory {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  method: string;
  location: string;
  status: "Present" | "Late" | "Absent";
  hoursWorked: number;
}

interface SummaryStats {
  totalRecords: number;
  totalHours: number;
  lateCount: number;
  absentCount: number;
}

export default function StaffAttendanceHistory() {
  const [records, setRecords] = useState<AttendanceHistory[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceHistory[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalRecords: 0,
    totalHours: 0,
    lateCount: 0,
    absentCount: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost/etms/controllers/get-attendance-history.php",
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRecords(data.records || []);
      setFilteredRecords(data.records || []);
      setSummary(data.summary || summary);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [summary]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let filtered = [...records];

    if (search) {
      filtered = filtered.filter((r) =>
        r.date.includes(search) ||
        r.method.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(
        (r) => r.date >= startDate && r.date <= endDate
      );
    }

    setFilteredRecords(filtered);
  }, [search, statusFilter, startDate, endDate, records]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page]);

  const exportCSV = () => {
    const rows = [
      ["date", "checkIn", "checkOut", "method", "location", "status", "hours"],
      ...filteredRecords.map((r) => [r.date, r.checkIn || "", r.checkOut || "", r.method, r.location, r.status, r.hoursWorked.toString()]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-history-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="history-container">
      {/* HEADER */}
      <div className="history-header">
        <div>
          <h1>Attendance History</h1>
          <p>Review your complete attendance logs</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="history-summary">
        <div className="summary-card">
          <h4>Total Records</h4>
          <p>{summary.totalRecords}</p>
        </div>
        <div className="summary-card hours">
          <h4>Total Hours</h4>
          <p>{summary.totalHours}h</p>
        </div>
        <div className="summary-card late">
          <h4>Late Days</h4>
          <p>{summary.lateCount}</p>
        </div>
        <div className="summary-card absent">
          <h4>Absent Days</h4>
          <p>{summary.absentCount}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <div className="controls">
          <input type="text" placeholder="Search by date or method..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading">Loading attendance history...</div>
        ) : (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">No records found</td>
                  </tr>
                ) : (
                  paginated.map((record) => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>{record.checkIn || "-"}</td>
                      <td>{record.checkOut || "-"}</td>
                      <td>{record.location}</td>
                      <td><span className={`badge ${record.status.toLowerCase()}`}>{record.status}</span></td>
                      <td>{record.hoursWorked}h</td>
                      <td className="row-actions">
                        <button className="btn ghost" onClick={() => toggleExpand(record.id)}>{expandedId === record.id ? 'Hide' : 'Details'}</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* detail rows */}
            {paginated.map((r) => (
              expandedId === r.id ? (
                <div key={`d-${r.id}`} className="detail-row">
                  <div className="detail-cell">Method: {r.method} &nbsp;|&nbsp; Location: {r.location} &nbsp;|&nbsp; Raw check-in: {r.checkIn || '—'} &nbsp;|&nbsp; Raw check-out: {r.checkOut || '—'}</div>
                </div>
              ) : null
            ))}

            {/* pagination */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="btn ghost" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
              <div style={{ alignSelf: 'center', color: '#475569' }}>Page {page} / {Math.max(1, Math.ceil(filteredRecords.length / perPage))}</div>
              <button className="btn ghost" onClick={() => setPage((p) => Math.min(Math.ceil(filteredRecords.length / perPage), p + 1))} disabled={page >= Math.ceil(filteredRecords.length / perPage)}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}