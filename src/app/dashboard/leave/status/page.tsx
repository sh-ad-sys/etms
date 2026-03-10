"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  RefreshCw,
  MessageSquare,
  Paperclip,
  User,
  ShieldCheck,
} from "lucide-react";

import "@/styles/status.css";

/* ─── Types ─────────────────────────────────────────────── */

type LeaveStatusType = "All" | "Pending" | "Approved" | "Rejected";

type Leave = {
  id:                  string;
  type:                string;
  startDate:           string;
  endDate:             string;
  days:                number;
  reason:              string;
  status:              "Pending" | "Approved" | "Rejected";
  supervisorApproval:  string;
  managerApproval:     string;
  supervisorRemarks:   string;
  hasDocument:         boolean;
  appliedOn:           string;
  reviewedOn:          string | null;
  reviewedBy:          string | null;
};

type Summary = {
  total:    number;
  approved: number;
  pending:  number;
  rejected: number;
};

const API = "http://localhost/etms/controllers/leave";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const approvalColor = (val: string) => {
  if (val === "Approved") return { background: "#dcfce7", color: "#166534" };
  if (val === "Rejected") return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fef9c3", color: "#854d0e" };
};

/* ─── Component ─────────────────────────────────────────── */

export default function LeaveStatusPage() {

  const [leaves,   setLeaves]   = useState<Leave[]>([]);
  const [summary,  setSummary]  = useState<Summary>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<LeaveStatusType>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  /* ── Fetch ── */

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/get-leave-status.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves   || []);
        setSummary(data.summary || { total: 0, approved: 0, pending: 0, rejected: 0 });
      } else {
        setError(data.error || "Failed to load leave records.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  /* ── Filter + search ── */

  const filtered = useMemo(() =>
    leaves
      .filter((l) => filter === "All" || l.status === filter)
      .filter((l) => l.type.toLowerCase().includes(search.toLowerCase())),
    [leaves, filter, search]
  );

  /* ── Render ── */

  return (
    <div className="leave-status-page">

      {/* HEADER */}
      <div className="leave-header">
        <h1><CalendarCheck size={22} /> Leave Status</h1>
        <p>Dashboard / Leave / Status</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="leave-summary">
        <div className="summary-card">
          <div className="summary-icon icon-blue"><Clock size={18} /></div>
          <div><h3>{summary.total}</h3><p>Total Applications</p></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon icon-green"><CheckCircle size={18} /></div>
          <div><h3>{summary.approved}</h3><p>Approved</p></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon icon-yellow"><Clock size={18} /></div>
          <div><h3>{summary.pending}</h3><p>Pending</p></div>
        </div>
        <div className="summary-card">
          <div className="summary-icon icon-red"><XCircle size={18} /></div>
          <div><h3>{summary.rejected}</h3><p>Rejected</p></div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="leave-controls">

        <div className="filter-tabs">
          {(["All", "Pending", "Approved", "Rejected"] as LeaveStatusType[]).map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
              {item !== "All" && (
                <span className={`tab-count tab-${item.toLowerCase()}`}>
                  {item === "Approved" ? summary.approved
                   : item === "Pending" ? summary.pending
                   : summary.rejected}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="controls-right">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search leave type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="refresh-btn" onClick={fetchLeaves} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} />
          </button>
        </div>

      </div>

      {/* ERROR */}
      {error && <div className="status-error">{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="status-loading">
          <Loader2 size={20} className="spin" /> Loading leave records...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="leave-table-wrapper">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave) => (
                <>
                  <tr
                    key={leave.id}
                    className={`leave-row ${expanded === leave.id ? "row-expanded" : ""}`}
                  >
                    <td>
                      <span className="leave-type-label">{leave.type}</span>
                      {leave.hasDocument && (
                        <span title="Has document" style={{ display: "inline-flex", marginLeft: 6 }}>
                          <Paperclip size={12} className="doc-icon" />
                        </span>
                      )}
                    </td>
                    <td>{fmt(leave.startDate)}</td>
                    <td>{fmt(leave.endDate)}</td>
                    <td><strong>{leave.days}</strong></td>
                    <td>{fmt(leave.appliedOn)}</td>
                    <td>
                      <span className={`status-badge ${leave.status.toLowerCase()}`}>
                        {leave.status === "Pending"  && <Clock size={12} />}
                        {leave.status === "Approved" && <CheckCircle size={12} />}
                        {leave.status === "Rejected" && <XCircle size={12} />}
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="expand-btn"
                        onClick={() => setExpanded(expanded === leave.id ? null : leave.id)}
                      >
                        {expanded === leave.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED DETAIL ROW */}
                  {expanded === leave.id && (
                    <tr key={`${leave.id}-detail`} className="detail-row">
                      <td colSpan={7}>
                        <div className="detail-panel">

                          {/* Reason */}
                          <div className="detail-item">
                            <span className="detail-label">Reason</span>
                            <p>{leave.reason}</p>
                          </div>

                          {/* Approval chain */}
                          <div className="detail-item">
                            <span className="detail-label">
                              <ShieldCheck size={13} /> Approval Chain
                            </span>
                            <div className="approval-chain">
                              <span className="approval-step">
                                Supervisor
                                <span
                                  className="approval-badge"
                                  style={approvalColor(leave.supervisorApproval)}
                                >
                                  {leave.supervisorApproval}
                                </span>
                              </span>
                              <span className="approval-arrow">→</span>
                              <span className="approval-step">
                                Manager
                                <span
                                  className="approval-badge"
                                  style={approvalColor(leave.managerApproval)}
                                >
                                  {leave.managerApproval}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Supervisor remarks */}
                          {leave.supervisorRemarks && (
                            <div className="detail-item">
                              <span className="detail-label">
                                <MessageSquare size={13} /> Supervisor Remarks
                              </span>
                              <p>{leave.supervisorRemarks}</p>
                            </div>
                          )}

                          {/* Reviewed by */}
                          {leave.reviewedBy && (
                            <div className="detail-item">
                              <span className="detail-label">
                                <User size={13} /> Reviewed By
                              </span>
                              <p>
                                {leave.reviewedBy}
                                {leave.reviewedOn ? ` · ${fmt(leave.reviewedOn)}` : ""}
                              </p>
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !error && (
            <div className="empty-state">No leave records found.</div>
          )}

        </div>
      )}

    </div>
  );
}