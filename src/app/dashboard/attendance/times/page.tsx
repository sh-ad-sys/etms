"use client";

import { useEffect, useState } from "react";
import "../../../../styles/times.css";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  method: string;
  location: string;
  status: "Present" | "Late" | "Absent";
  hoursWorked: number;
}

interface Summary {
  totalDays: number;
  present: number;
  late: number;
  absent: number;
  totalHours: number;
}

export default function AttendanceTimesPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalDays: 0,
    present: 0,
    late: 0,
    absent: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost/etms/controllers/get-attendance.php?date=${selectedDate}`,
        { credentials: "include" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch attendance");

      setRecords(data.records || []);
      setSummary(data.summary || summary);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const formatTime = (t?: string | null) => {
    if (!t) return "-";
    // try to parse ISO or fallback to raw
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    // fallback: if string looks like HH:MM:SS
    const hhmm = t.slice(0,5);
    return hhmm;
  };

  return (
    <div className="attendance-container">
      {/* HEADER */}
      <div className="attendance-header">
        <div>
          <h1>Attendance</h1>
          <p>Daily arrival and departure records — concise and verifiable</p>
        </div>

        <input type="date" className="date-filter" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Days</h3>
          <p>{summary.totalDays}</p>
        </div>

        <div className="summary-card present">
          <h3>Present</h3>
          <p>{summary.present}</p>
        </div>

        <div className="summary-card late">
          <h3>Late</h3>
          <p>{summary.late}</p>
        </div>

        <div className="summary-card absent">
          <h3>Absent</h3>
          <p>{summary.absent}</p>
        </div>

        <div className="summary-card hours">
          <h3>Total Hours</h3>
          <p>{summary.totalHours}h</p>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="error-box">{error}</div>}

      {/* TABLE */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading attendance records...</div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Arrival</th>
                <th>Departure</th>
                <th>Location</th>
                <th>Status</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>
                      <div className="time-block">
                        <span className="time-value">{formatTime(record.checkIn)}</span>
                        <span className="time-meta">{record.method || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-block">
                        <span className="time-value">{formatTime(record.checkOut)}</span>
                        <span className="time-meta">&nbsp;</span>
                      </div>
                    </td>
                    <td>
                      <span className="location-chip">{record.location || "—"}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>{record.status}</span>
                    </td>
                    <td>{record.hoursWorked}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}