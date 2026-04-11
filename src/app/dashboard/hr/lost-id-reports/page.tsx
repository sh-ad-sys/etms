"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleX, FileWarning, RefreshCw } from "lucide-react";
import "@/styles/hr.css";

type LostReportStatus = "PENDING" | "APPROVED" | "REJECTED";

type LostIdReport = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  employeeId: string;
  cardNumber: string | null;
  dateLost: string;
  location: string;
  notes: string;
  evidenceFile: string | null;
  status: LostReportStatus;
  createdAt: string;
};

const ENDPOINTS = {
  list: "http://localhost/etms/controllers/hr/get-lost-id-reports.php",
  review: "http://localhost/etms/controllers/hr/review-lost-id-report.php",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatSimpleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusTone(status: LostReportStatus) {
  switch (status) {
    case "APPROVED":
      return {
        bg: "#dcfce7",
        color: "#166534",
        border: "#86efac",
        label: "Approved",
      };
    case "REJECTED":
      return {
        bg: "#fee2e2",
        color: "#991b1b",
        border: "#fca5a5",
        label: "Rejected",
      };
    default:
      return {
        bg: "#fef3c7",
        color: "#92400e",
        border: "#fcd34d",
        label: "Pending",
      };
  }
}

export default function HRLostIdReportsPage() {
  const [reports, setReports] = useState<LostIdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const loadReports = async () => {
    setError(null);

    try {
      const res = await fetch(ENDPOINTS.list, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load lost ID reports");
      }

      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load lost ID reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === "PENDING"),
    [reports]
  );

  const reviewedReports = useMemo(
    () => reports.filter((report) => report.status !== "PENDING"),
    [reports]
  );

  const handleReview = async (reportId: number, action: "APPROVED" | "REJECTED") => {
    setActingId(reportId);
    setError(null);

    try {
      const res = await fetch(ENDPOINTS.review, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportId, action }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to review report");
      }

      setReports((current) =>
        current.map((report) =>
          report.id === reportId ? { ...report, status: action } : report
        )
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to review report");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <div>
          <h1 className="hr-title">Lost ID Reports</h1>
          <p className="hr-subtitle">Verify lost ID submissions before staff move on to replacement approval.</p>
        </div>
        <div className="hr-header-right">
          <button type="button" className="hr-refresh-btn" onClick={loadReports} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : undefined} />
          </button>
          <Link href="/dashboard/hr" className="hr-refresh-btn" style={{ textDecoration: "none" }}>
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>

      {error && <div className="hr-error">{error}</div>}

      <section className="hr-section">
        <h2>
          <FileWarning size={18} /> Report Queue
        </h2>

        <div className="hr-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="hr-stat-card amber">
            <AlertTriangle className="hr-stat-icon" />
            <h4>Pending Reports</h4>
            <p>{pendingReports.length}</p>
          </div>
          <div className="hr-stat-card green">
            <CheckCircle2 className="hr-stat-icon" />
            <h4>Approved</h4>
            <p>{reports.filter((report) => report.status === "APPROVED").length}</p>
          </div>
          <div className="hr-stat-card red">
            <CircleX className="hr-stat-icon" />
            <h4>Rejected</h4>
            <p>{reports.filter((report) => report.status === "REJECTED").length}</p>
          </div>
        </div>
      </section>

      <section className="hr-section">
        <h2>
          <AlertTriangle size={18} /> Pending Review
        </h2>

        {loading ? (
          <div className="hr-loading">
            <RefreshCw className="spin" size={18} /> Loading lost ID reports...
          </div>
        ) : pendingReports.length === 0 ? (
          <div className="hr-card" style={{ cursor: "default" }}>
            <h3>No pending lost ID reports</h3>
            <p>Once a staff member reports a missing ID card, the submission will appear here for HR review.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {pendingReports.map((report) => (
              <article key={report.id} className="hr-card" style={{ cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{report.fullName}</h3>
                      <p>{report.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 9999,
                          padding: "6px 12px",
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fcd34d",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Employee ID: {report.employeeId}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 9999,
                          padding: "6px 12px",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          border: "1px solid #93c5fd",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Card: {report.cardNumber || "Not assigned"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 9999,
                          padding: "6px 12px",
                          background: "#fff7ed",
                          color: "#9a3412",
                          border: "1px solid #fdba74",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Lost on {formatSimpleDate(report.dateLost)}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 9999,
                          padding: "6px 12px",
                          background: "#f8fafc",
                          color: "#475569",
                          border: "1px solid #e2e8f0",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Submitted {formatDate(report.createdAt)}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#1a3a6b", fontSize: 13 }}>Location</strong>
                      <p style={{ marginTop: 6 }}>{report.location}</p>
                    </div>
                    <div>
                      <strong style={{ color: "#1a3a6b", fontSize: 13 }}>Staff note</strong>
                      <p style={{ marginTop: 6 }}>
                        {report.notes?.trim() || "No additional details were provided."}
                      </p>
                    </div>
                    {report.evidenceFile && (
                      <a
                        href={`http://localhost/etms/${report.evidenceFile}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#2563eb", fontWeight: 600, fontSize: 13 }}
                      >
                        View evidence attachment
                      </a>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 10, minWidth: 220, alignContent: "start" }}>
                    <button
                      type="button"
                      onClick={() => handleReview(report.id, "APPROVED")}
                      disabled={actingId === report.id}
                      style={{
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: actingId === report.id ? "not-allowed" : "pointer",
                        opacity: actingId === report.id ? 0.7 : 1,
                      }}
                    >
                      {actingId === report.id ? "Processing..." : "Approve lost report"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(report.id, "REJECTED")}
                      disabled={actingId === report.id}
                      style={{
                        border: "1px solid #fecaca",
                        borderRadius: 12,
                        padding: "12px 16px",
                        background: "#fff1f2",
                        color: "#b91c1c",
                        fontWeight: 700,
                        cursor: actingId === report.id ? "not-allowed" : "pointer",
                        opacity: actingId === report.id ? 0.7 : 1,
                      }}
                    >
                      Reject report
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="hr-section">
        <h2>
          <CheckCircle2 size={18} /> Reviewed Reports
        </h2>

        {reviewedReports.length === 0 ? (
          <div className="hr-card" style={{ cursor: "default" }}>
            <h3>No reviewed reports yet</h3>
            <p>Approved and rejected lost ID reports will stay here for reference.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {reviewedReports.map((report) => {
              const tone = statusTone(report.status);

              return (
                <article key={report.id} className="hr-card" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{report.fullName}</h3>
                      <p>{report.email}</p>
                      <p style={{ marginTop: 10 }}>Lost at {report.location}</p>
                    </div>
                    <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: 9999,
                          padding: "6px 12px",
                          background: tone.bg,
                          color: tone.color,
                          border: `1px solid ${tone.border}`,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {tone.label}
                      </span>
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        Submitted {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
