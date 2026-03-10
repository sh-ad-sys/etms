"use client";

import { useState } from "react";
import {
  Clock,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import "@/styles/late-logs.css";

type Status = "Excused" | "Unexcused";

type LateLog = {
  id: string;
  name: string;
  department: string;
  date: string;
  checkIn: string;
  minutesLate: number;
  reason: string;
  status: Status;
};

export default function LateLogsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");

  const logs: LateLog[] = [
    {
      id: "1",
      name: "John Mwangi",
      department: "Production",
      date: "2026-02-25",
      checkIn: "08:17 AM",
      minutesLate: 17,
      reason: "Traffic delay",
      status: "Excused",
    },
    {
      id: "2",
      name: "Peter Otieno",
      department: "Warehouse",
      date: "2026-02-25",
      checkIn: "08:32 AM",
      minutesLate: 32,
      reason: "No explanation submitted",
      status: "Unexcused",
    },
    {
      id: "3",
      name: "David Kimani",
      department: "Maintenance",
      date: "2026-02-24",
      checkIn: "08:10 AM",
      minutesLate: 10,
      reason: "Medical appointment",
      status: "Excused",
    },
  ];

  const filteredLogs = logs
    .filter(
      (log) =>
        log.name.toLowerCase().includes(search.toLowerCase()) ||
        log.department.toLowerCase().includes(search.toLowerCase())
    )
    .filter((log) =>
      statusFilter === "All" ? true : log.status === statusFilter
    );

  const totalLate = logs.length;
  const excused = logs.filter((l) => l.status === "Excused").length;
  const unexcused = logs.filter((l) => l.status === "Unexcused").length;

  return (
    <div className="late-page">

      {/* HEADER */}
      <div className="late-header">
        <h1>
          <Clock size={24} /> Late Arrival Logs
        </h1>
        <p>Monitor staff punctuality and late check-ins</p>
      </div>

      {/* KPI SUMMARY */}
      <div className="late-kpi">
        <div className="kpi-card">
          <h3>{totalLate}</h3>
          <p>Total Late Today</p>
        </div>
        <div className="kpi-card success">
          <h3>{excused}</h3>
          <p>Excused</p>
        </div>
        <div className="kpi-card danger">
          <h3>{unexcused}</h3>
          <p>Unexcused</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="late-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as Status | "All")
            }
          >
            <option value="All">All Status</option>
            <option value="Excused">Excused</option>
            <option value="Unexcused">Unexcused</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
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
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.name}</td>
                <td>{log.department}</td>
                <td>{log.date}</td>
                <td>{log.checkIn}</td>
                <td className="late-minutes">{log.minutesLate} min</td>
                <td>{log.reason}</td>
                <td>
                  <span
                    className={`status-badge ${log.status.toLowerCase()}`}
                  >
                    {log.status === "Excused" ? (
                      <>
                        <CheckCircle size={12} /> {log.status}
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} /> {log.status}
                      </>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="empty-state">
            No late records found.
          </div>
        )}
      </div>
    </div>
  );
}