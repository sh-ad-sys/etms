"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Search,
  CalendarDays,
  CheckCircle,
  Eye,
} from "lucide-react";
import "@/styles/missing-checkins.css";

type Status = "Unresolved" | "Resolved";

type MissingCheckin = {
  id: string;
  name: string;
  department: string;
  date: string;
  expectedTime: string;
  status: Status;
};

export default function MissingCheckinsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");

  const [records, setRecords] = useState<MissingCheckin[]>([
    {
      id: "1",
      name: "John Kamau",
      department: "Production",
      date: "2026-03-01",
      expectedTime: "08:00 AM",
      status: "Unresolved",
    },
    {
      id: "2",
      name: "Mary Wanjiku",
      department: "Warehouse",
      date: "2026-03-01",
      expectedTime: "08:00 AM",
      status: "Unresolved",
    },
    {
      id: "3",
      name: "David Otieno",
      department: "Logistics",
      date: "2026-02-28",
      expectedTime: "08:00 AM",
      status: "Resolved",
    },
  ]);

  const markResolved = (id: string) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Resolved" } : item
      )
    );
  };

  const filteredRecords = records
    .filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase())
    )
    .filter((r) => (filter === "All" ? true : r.status === filter));

  const total = records.length;
  const unresolved = records.filter((r) => r.status === "Unresolved").length;
  const resolved = records.filter((r) => r.status === "Resolved").length;

  return (
    <div className="missing-page">
      {/* HEADER */}
      <div className="missing-header">
        <h1>
          <AlertTriangle size={24} />
          Missing Check-ins
        </h1>
        <p>Supervisor / Attendance Monitoring</p>
      </div>

      {/* SUMMARY */}
      <div className="missing-summary">
        <div className="summary-card">
          <h3>{total}</h3>
          <p>Total Records</p>
        </div>
        <div className="summary-card warning">
          <h3>{unresolved}</h3>
          <p>Unresolved</p>
        </div>
        <div className="summary-card success">
          <h3>{resolved}</h3>
          <p>Resolved</p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="missing-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search staff or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {["All", "Unresolved", "Resolved"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item as Status | "All")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="missing-table-wrapper">
        <table className="missing-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Department</th>
              <th>Date</th>
              <th>Expected Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.name}</td>
                <td>{record.department}</td>
                <td>{record.date}</td>
                <td>{record.expectedTime}</td>
                <td>
                  <span
                    className={`status-badge ${record.status.toLowerCase()}`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="view-btn">
                    <Eye size={14} /> View
                  </button>

                  {record.status === "Unresolved" && (
                    <button
                      className="resolve-btn"
                      onClick={() => markResolved(record.id)}
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div className="empty-state">No records found.</div>
        )}
      </div>
    </div>
  );
}