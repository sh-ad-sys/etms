"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";
import "@/styles/corrections.css";

type Status = "Pending" | "Approved" | "Rejected";

type CorrectionRequest = {
  id: string;
  employee: string;
  date: string;
  originalTime: string;
  requestedTime: string;
  reason: string;
  submittedAt: string;
  status: Status;
};

export default function SupervisorCorrectionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");

  const [requests, setRequests] = useState<CorrectionRequest[]>([
    {
      id: "1",
      employee: "John Mwangi",
      date: "2026-02-24",
      originalTime: "09:32 AM",
      requestedTime: "08:00 AM",
      reason: "System failed to capture fingerprint during check-in.",
      submittedAt: "2026-02-24 10:15 AM",
      status: "Pending",
    },
    {
      id: "2",
      employee: "Grace Achieng",
      date: "2026-02-22",
      originalTime: "Absent",
      requestedTime: "08:05 AM - 05:00 PM",
      reason: "Attended safety training off-site.",
      submittedAt: "2026-02-22 06:00 PM",
      status: "Approved",
    },
  ]);

  const updateStatus = (id: string, status: Status) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status } : req
      )
    );
  };

  const filteredRequests = requests
    .filter((req) =>
      req.employee.toLowerCase().includes(search.toLowerCase())
    )
    .filter((req) =>
      filter === "All" ? true : req.status === filter
    );

  return (
    <div className="corrections-page">
      {/* HEADER */}
      <div className="corrections-header">
        <h1>
          <ClipboardCheck size={24} />
          Attendance Correction Requests
        </h1>
        <p>Dashboard / Supervisor / Corrections</p>
      </div>

      {/* CONTROLS */}
      <div className="corrections-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {["All", "Pending", "Approved", "Rejected"].map((item) => (
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

      {/* REQUEST CARDS */}
      <div className="corrections-grid">
        {filteredRequests.map((req) => (
          <div key={req.id} className="correction-card">
            <div className="card-top">
              <div>
                <h3><User size={16} /> {req.employee}</h3>
                <span><CalendarDays size={14} /> {req.date}</span>
              </div>

              <span className={`status ${req.status.toLowerCase()}`}>
                {req.status}
              </span>
            </div>

            <div className="card-body">
              <p>
                <strong>Original:</strong> {req.originalTime}
              </p>
              <p>
                <strong>Requested:</strong> {req.requestedTime}
              </p>
              <p className="reason">
                <strong>Reason:</strong> {req.reason}
              </p>
              <p className="submitted">
                <Clock size={14} /> Submitted: {req.submittedAt}
              </p>
            </div>

            {req.status === "Pending" && (
              <div className="card-actions">
                <button
                  className="approve"
                  onClick={() => updateStatus(req.id, "Approved")}
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  className="reject"
                  onClick={() => updateStatus(req.id, "Rejected")}
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="empty-state">
            No correction requests found.
          </div>
        )}
      </div>
    </div>
  );
}