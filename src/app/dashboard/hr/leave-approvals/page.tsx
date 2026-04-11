"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  AlertCircle,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import "@/styles/leave-requests.css";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type FilterType = "ALL" | ApprovalStatus;

type LeaveRequest = {
  id: string;
  workerName: string;
  employeeCode: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  hasDocument: boolean;
  supervisorApproval: ApprovalStatus;
  managerApproval: ApprovalStatus;
  hrApproval: ApprovalStatus;
  finalStatus: ApprovalStatus;
  appliedOn: string;
};

type Summary = { total: number; pending: number; approved: number; rejected: number };

const API = "http://localhost/etms/controllers/hr";
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function HRLeaveApprovalsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/get-leave-requests.php?status=${filter}`, { credentials: "include" });
      if (res.status === 401) {
        setError("Session expired.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setSummary(data.summary || { total: 0, pending: 0, approved: 0, rejected: 0 });
      } else {
        setError(data.error || "Failed to load HR leave approvals.");
      }
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async (id: string, action: "APPROVED" | "REJECTED") => {
    setActing(id);
    try {
      const res = await fetch(`${API}/review-leave.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((request) =>
            request.id === id ? { ...request, hrApproval: action, finalStatus: action } : request
          )
        );
        setSummary((current) => ({
          ...current,
          pending: Math.max(0, current.pending - 1),
          approved: action === "APPROVED" ? current.approved + 1 : current.approved,
          rejected: action === "REJECTED" ? current.rejected + 1 : current.rejected,
        }));
        setExpandedId(null);
        showToast(data.message, "success");
      } else {
        showToast(data.error || "Failed to update.", "error");
      }
    } catch {
      showToast("Unable to connect.", "error");
    } finally {
      setActing(null);
    }
  };

  const filtered = useMemo(
    () => requests.filter((request) => filter === "ALL" || request.hrApproval === filter),
    [requests, filter]
  );

  return (
    <div className="lr-page">
      {toast && (
        <div className={`lr-toast lr-toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="lr-header">
        <div>
          <h1>
            <Calendar size={22} /> HR Leave Approvals
          </h1>
          <p>Dashboard / HR / Leave Approvals</p>
        </div>
        <button className="lr-refresh-btn" onClick={fetchRequests} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="lr-summary">
        <div className="lr-stat lr-stat-blue">
          <Users size={18} />
          <div>
            <h3>{summary.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="lr-stat lr-stat-amber">
          <Clock size={18} />
          <div>
            <h3>{summary.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="lr-stat lr-stat-green">
          <CheckCircle2 size={18} />
          <div>
            <h3>{summary.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="lr-stat lr-stat-red">
          <XCircle size={18} />
          <div>
            <h3>{summary.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="lr-tabs">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterType[]).map((item) => (
          <button key={item} className={`lr-tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>
            {item === "ALL" ? "All" : item.charAt(0) + item.slice(1).toLowerCase()}
            {item !== "ALL" && (
              <span className={`lr-tab-count lr-count-${item.toLowerCase()}`}>
                {item === "PENDING" ? summary.pending : item === "APPROVED" ? summary.approved : summary.rejected}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="lr-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading && (
        <div className="lr-loading">
          <Loader2 size={20} className="spin" /> Loading approvals...
        </div>
      )}

      {!loading && (
        <div className="lr-table-wrapper">
          <table className="lr-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Applied On</th>
                <th>HR Status</th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((request) => (
                <>
                  <tr key={request.id} className={`lr-row ${request.hrApproval !== "PENDING" ? "lr-row-reviewed" : ""}`}>
                    <td>
                      <div className="lr-worker">
                        <span className="lr-worker-name">{request.workerName}</span>
                        <span className="lr-worker-meta">
                          {request.employeeCode && <span>{request.employeeCode}</span>}
                          {request.department && <span>{request.department}</span>}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="lr-leave-type">{request.leaveType}</span>
                      {request.hasDocument && (
                        <span title="Has document" style={{ marginLeft: 6, display: "inline-flex" }}>
                          <Paperclip size={12} color="#94a3b8" />
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="lr-duration">
                        <span className="lr-days">{request.totalDays}d</span>
                        <span className="lr-dates">
                          {fmt(request.startDate)} - {fmt(request.endDate)}
                        </span>
                      </div>
                    </td>
                    <td>{fmt(request.appliedOn)}</td>
                    <td>
                      <span className={`lr-status-badge lr-status-${request.hrApproval.toLowerCase()}`}>
                        {request.hrApproval === "PENDING" && <Clock size={11} />}
                        {request.hrApproval === "APPROVED" && <CheckCircle2 size={11} />}
                        {request.hrApproval === "REJECTED" && <XCircle size={11} />}
                        {request.hrApproval.charAt(0) + request.hrApproval.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td>
                      {request.hrApproval === "PENDING" ? (
                        <div className="lr-action-btns">
                          <button className="lr-btn-approve" onClick={() => handleReview(request.id, "APPROVED")} disabled={acting === request.id}>
                            {acting === request.id ? <Loader2 size={13} className="spin" /> : <CheckCircle2 size={13} />}
                            Approve
                          </button>
                          <button className="lr-btn-reject" onClick={() => handleReview(request.id, "REJECTED")} disabled={acting === request.id}>
                            {acting === request.id ? <Loader2 size={13} className="spin" /> : <XCircle size={13} />}
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="lr-reviewed-label">Reviewed</span>
                      )}
                    </td>
                    <td>
                      <button className="lr-expand-btn" onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}>
                        {expandedId === request.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>
                  </tr>

                  {expandedId === request.id && (
                    <tr key={`${request.id}-detail`} className="lr-detail-row">
                      <td colSpan={7}>
                        <div className="lr-detail-panel">
                          <div className="lr-detail-item">
                            <span className="lr-detail-label">Reason</span>
                            <p>{request.reason}</p>
                          </div>
                          <div className="lr-detail-inline">
                            <div className="lr-detail-item">
                              <span className="lr-detail-label">Supervisor Approval</span>
                              <span className={`lr-status-badge lr-status-${request.supervisorApproval.toLowerCase()}`}>
                                {request.supervisorApproval.charAt(0) + request.supervisorApproval.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <div className="lr-detail-item">
                              <span className="lr-detail-label">Manager Approval</span>
                              <span className={`lr-status-badge lr-status-${request.managerApproval.toLowerCase()}`}>
                                {request.managerApproval.charAt(0) + request.managerApproval.slice(1).toLowerCase()}
                              </span>
                            </div>
                            <div className="lr-detail-item">
                              <span className="lr-detail-label">Final Status</span>
                              <span className={`lr-status-badge lr-status-${request.finalStatus.toLowerCase()}`}>
                                {request.finalStatus.charAt(0) + request.finalStatus.slice(1).toLowerCase()}
                              </span>
                            </div>
                          </div>
                          <div className="lr-detail-item">
                            <span className="lr-detail-label">
                              <ShieldCheck size={13} /> Approval Route
                            </span>
                            <p>Supervisor and manager have already approved this request. HR is the final approval stage.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !error && <div className="lr-empty">No leave requests found.</div>}
        </div>
      )}
    </div>
  );
}
