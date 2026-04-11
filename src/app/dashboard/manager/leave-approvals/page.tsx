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

const API = "http://localhost/etms/controllers/manager";
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function ManagerLeaveApprovalsPage() {
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
        setError(data.error || "Failed to load leave approvals.");
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
          prev.map((r) =>
            r.id === id
              ? { ...r, managerApproval: action, finalStatus: action === "REJECTED" ? "REJECTED" : r.finalStatus }
              : r
          )
        );
        setSummary((s) => ({
          ...s,
          pending: Math.max(0, s.pending - 1),
          approved: action === "APPROVED" ? s.approved + 1 : s.approved,
          rejected: action === "REJECTED" ? s.rejected + 1 : s.rejected,
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

  const filtered = useMemo(() => requests.filter((r) => filter === "ALL" || r.managerApproval === filter), [requests, filter]);

  return (
    <div className="lr-page">
      {toast && <div className={`lr-toast lr-toast-${toast.type}`}>{toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{toast.msg}</div>}

      <div className="lr-header">
        <div>
          <h1><Calendar size={22} /> Manager Leave Approvals</h1>
          <p>Dashboard / Manager / Leave Approvals</p>
        </div>
        <button className="lr-refresh-btn" onClick={fetchRequests} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="lr-summary">
        <div className="lr-stat lr-stat-blue"><Users size={18} /><div><h3>{summary.total}</h3><p>Total</p></div></div>
        <div className="lr-stat lr-stat-amber"><Clock size={18} /><div><h3>{summary.pending}</h3><p>Pending</p></div></div>
        <div className="lr-stat lr-stat-green"><CheckCircle2 size={18} /><div><h3>{summary.approved}</h3><p>Approved</p></div></div>
        <div className="lr-stat lr-stat-red"><XCircle size={18} /><div><h3>{summary.rejected}</h3><p>Rejected</p></div></div>
      </div>

      <div className="lr-tabs">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as FilterType[]).map((f) => (
          <button key={f} className={`lr-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== "ALL" && <span className={`lr-tab-count lr-count-${f.toLowerCase()}`}>{f === "PENDING" ? summary.pending : f === "APPROVED" ? summary.approved : summary.rejected}</span>}
          </button>
        ))}
      </div>

      {error && <div className="lr-error"><AlertCircle size={15} /> {error}</div>}
      {loading && <div className="lr-loading"><Loader2 size={20} className="spin" /> Loading approvals...</div>}

      {!loading && (
        <div className="lr-table-wrapper">
          <table className="lr-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Applied On</th>
                <th>Manager Status</th>
                <th>Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <>
                  <tr key={req.id} className={`lr-row ${req.managerApproval !== "PENDING" ? "lr-row-reviewed" : ""}`}>
                    <td><div className="lr-worker"><span className="lr-worker-name">{req.workerName}</span><span className="lr-worker-meta">{req.employeeCode && <span>{req.employeeCode}</span>}{req.department && <span>{req.department}</span>}</span></div></td>
                    <td><span className="lr-leave-type">{req.leaveType}</span>{req.hasDocument && <span title="Has document" style={{ marginLeft: 6, display: "inline-flex" }}><Paperclip size={12} color="#94a3b8" /></span>}</td>
                    <td><div className="lr-duration"><span className="lr-days">{req.totalDays}d</span><span className="lr-dates">{fmt(req.startDate)} — {fmt(req.endDate)}</span></div></td>
                    <td>{fmt(req.appliedOn)}</td>
                    <td><span className={`lr-status-badge lr-status-${req.managerApproval.toLowerCase()}`}>{req.managerApproval === "PENDING" && <Clock size={11} />}{req.managerApproval === "APPROVED" && <CheckCircle2 size={11} />}{req.managerApproval === "REJECTED" && <XCircle size={11} />}{req.managerApproval.charAt(0) + req.managerApproval.slice(1).toLowerCase()}</span></td>
                    <td>
                      {req.managerApproval === "PENDING" ? (
                        <div className="lr-action-btns">
                          <button className="lr-btn-approve" onClick={() => handleReview(req.id, "APPROVED")} disabled={acting === req.id}>{acting === req.id ? <Loader2 size={13} className="spin" /> : <CheckCircle2 size={13} />}Approve</button>
                          <button className="lr-btn-reject" onClick={() => handleReview(req.id, "REJECTED")} disabled={acting === req.id}>{acting === req.id ? <Loader2 size={13} className="spin" /> : <XCircle size={13} />}Reject</button>
                        </div>
                      ) : <span className="lr-reviewed-label">Reviewed</span>}
                    </td>
                    <td><button className="lr-expand-btn" onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}>{expandedId === req.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button></td>
                  </tr>

                  {expandedId === req.id && (
                    <tr key={`${req.id}-detail`} className="lr-detail-row">
                      <td colSpan={7}>
                        <div className="lr-detail-panel">
                          <div className="lr-detail-item"><span className="lr-detail-label">Reason</span><p>{req.reason}</p></div>
                          <div className="lr-detail-inline">
                            <div className="lr-detail-item"><span className="lr-detail-label">Supervisor Approval</span><span className={`lr-status-badge lr-status-${req.supervisorApproval.toLowerCase()}`}>{req.supervisorApproval.charAt(0) + req.supervisorApproval.slice(1).toLowerCase()}</span></div>
                            <div className="lr-detail-item"><span className="lr-detail-label">HR Approval</span><span className={`lr-status-badge lr-status-${req.hrApproval.toLowerCase()}`}>{req.hrApproval.charAt(0) + req.hrApproval.slice(1).toLowerCase()}</span></div>
                            <div className="lr-detail-item"><span className="lr-detail-label">Final Status</span><span className={`lr-status-badge lr-status-${req.finalStatus.toLowerCase()}`}>{req.finalStatus.charAt(0) + req.finalStatus.slice(1).toLowerCase()}</span></div>
                          </div>
                          <div className="lr-detail-item"><span className="lr-detail-label"><ShieldCheck size={13} /> Approval Route</span><p>Supervisor approves first, then manager reviews, and HR gives the final approval.</p></div>
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
