"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar,
  FileText,
  User,
  Phone,
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";

import "@/styles/apply.css";

/* ─── Types ─────────────────────────────────────────────── */

type LeaveType =
  | "Annual Leave"
  | "Sick Leave"
  | "Emergency Leave";

type Balances = Record<LeaveType, number>;

const LEAVE_TYPES: LeaveType[] = [
  "Annual Leave",
  "Sick Leave",
  "Emergency Leave",
];

const API = "http://localhost/etms/controllers/leave";

/* ─── Component ─────────────────────────────────────────── */

export default function ApplyLeavePage() {

  /* form state */
  const [leaveType,      setLeaveType]      = useState<LeaveType>("Annual Leave");
  const [startDate,      setStartDate]      = useState("");
  const [endDate,        setEndDate]        = useState("");
  const [reason,         setReason]         = useState("");
  const [contactPerson,  setContactPerson]  = useState("");
  const [contactPhone,   setContactPhone]   = useState("");
  const [docFile,        setDocFile]        = useState<File | null>(null);

  /* UI state */
  const [balances,       setBalances]       = useState<Balances | null>(null);
  const [loadingBal,     setLoadingBal]     = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [error,          setError]          = useState("");

  /* ── Fetch balances on mount ── */

  const fetchBalances = useCallback(async () => {
    setLoadingBal(true);
    try {
      const res  = await fetch(`${API}/get-leave-balance.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setBalances(data.balances);
    } catch {
      /* silently fall back to defaults */
    } finally {
      setLoadingBal(false);
    }
  }, []);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  /* ── Derived values ── */

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000 + 1;
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const currentBalance = balances ? (balances[leaveType] ?? 0) : 0;
  const overBalance = totalDays > currentBalance && totalDays > 0;
  const today          = new Date().toISOString().split("T")[0];

  /* ── Submit ── */

  const handleSubmit = async () => {
    setError("");

    if (!startDate || !endDate || !reason.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    if (overBalance) {
      setError(`Insufficient balance. You only have ${currentBalance} ${leaveType} days available.`);
      return;
    }

    setSubmitting(true);

    try {
      /* Use FormData to support optional file upload */
      const fd = new FormData();
      fd.append("leaveType",     leaveType);
      fd.append("startDate",     startDate);
      fd.append("endDate",       endDate);
      fd.append("reason",        reason);
      fd.append("contactPerson", contactPerson);
      fd.append("contactPhone",  contactPhone);
      if (docFile) fd.append("document", docFile);

      const res  = await fetch(`${API}/apply-leave.php`, {
        method:      "POST",
        credentials: "include",
        body:        fd,          // no Content-Type header — browser sets multipart boundary
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        /* Reset form */
        setStartDate(""); setEndDate(""); setReason("");
        setContactPerson(""); setContactPhone(""); setDocFile(null);
        fetchBalances(); // refresh balance display
      } else {
        setError(data.error || "Failed to submit leave request.");
      }

    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ── */

  return (
    <div className="leave-page">

      {/* HEADER */}
      <div className="leave-header">
        <h1><Calendar size={22} style={{ marginRight: 8 }} />Apply for Leave</h1>
        <p>Dashboard / Leave / Apply</p>
      </div>

      {/* BALANCE CARDS */}
      <div className="leave-balances">
        {loadingBal ? (
          <div className="balance-loading"><Loader2 size={16} className="spin" /> Loading balances...</div>
        ) : balances ? (
          LEAVE_TYPES.map((type) => (
            <div
              key={type}
              className={`balance-card ${leaveType === type ? "balance-active" : ""}`}
              onClick={() => setLeaveType(type)}
            >
              <span className="balance-type">{type}</span>
              <span className="balance-days">{balances[type]} days</span>
            </div>
          ))
        ) : null}
      </div>

      {/* SUCCESS */}
      {submitted && (
        <div className="leave-success">
          <CheckCircle2 size={18} />
          Leave request submitted successfully. Awaiting supervisor approval.
          <button className="success-close" onClick={() => setSubmitted(false)}>✕</button>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="leave-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* FORM */}
      <div className="leave-form">

        {/* Leave Type */}
        <div className="form-group">
          <label><FileText size={15} /> Leave Type <span className="req">*</span></label>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
            {LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="form-row">
          <div className="form-group">
            <label>Start Date <span className="req">*</span></label>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date <span className="req">*</span></label>
            <input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Days summary */}
        {totalDays > 0 && (
          <div className={`leave-days-summary ${overBalance ? "days-over" : "days-ok"}`}>
            {overBalance
              ? <><AlertCircle size={14} /> {totalDays} days requested — exceeds your {currentBalance}-day balance</>
              : <><Info size={14} /> {totalDays} day{totalDays > 1 ? "s" : ""} requested · {currentBalance - totalDays} days remaining after approval</>
            }
          </div>
        )}

        {/* Reason */}
        <div className="form-group">
          <label>Reason for Leave <span className="req">*</span></label>
          <textarea
            rows={4}
            placeholder="Provide a detailed explanation..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* Emergency Contact */}
        <div className="form-row">
          <div className="form-group">
            <label><User size={15} /> Emergency Contact Person</label>
            <input
              type="text"
              placeholder="Full name"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label><Phone size={15} /> Contact Phone</label>
            <input
              type="tel"
              placeholder="07XX XXX XXX"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label><Upload size={15} /> Supporting Document <span className="optional">(Optional — PDF, JPG, PNG · max 5MB)</span></label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
          />
          {docFile && (
            <span className="file-name">📎 {docFile.name}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={submitting || overBalance}
        >
          {submitting
            ? <><Loader2 size={16} className="spin" /> Submitting...</>
            : <><Calendar size={16} /> Submit Leave Request</>
          }
        </button>

      </div>

    </div>
  );
}