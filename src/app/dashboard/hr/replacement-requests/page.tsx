"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft, CheckCircle2, CircleX, Clock, RefreshCw } from "lucide-react";
import "@/styles/hr.css";

type ReplacementStatus = "PENDING" | "APPROVED" | "REJECTED";

type ReplacementRequest = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  cardNumber: string | null;
  notes: string;
  filePath: string | null;
  status: ReplacementStatus;
  createdAt: string;
};

const ENDPOINTS = {
  list: "http://localhost/etms/controllers/hr/get-replacement-requests.php",
  review: "http://localhost/etms/controllers/hr/review-replacement-request.php",
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

function statusTone(status: ReplacementStatus) {
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
        bg: "#dbeafe",
        color: "#1d4ed8",
        border: "#93c5fd",
        label: "Pending",
      };
  }
}

export default function HRReplacementRequestsPage() {
  const [requests, setRequests] = useState<ReplacementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const loadRequests = async () => {
    setError(null);

    try {
      const res = await fetch(ENDPOINTS.list, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load replacement requests");
      }

      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load replacement requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "PENDING"),
    [requests]
  );

  const reviewedRequests = useMemo(
    () => requests.filter((request) => request.status !== "PENDING"),
    [requests]
  );

  const handleReview = async (requestId: number, action: "APPROVED" | "REJECTED") => {
    setActingId(requestId);
    setError(null);

    try {
      const res = await fetch(ENDPOINTS.review, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to review request");
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? { ...request, status: action } : request
        )
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to review request");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <div>
          <h1 className="hr-title">Replacement Requests</h1>
          <p className="hr-subtitle">Approve or reject staff requests for lost ID replacement cards.</p>
        </div>
        <div className="hr-header-right">
          <button type="button" className="hr-refresh-btn" onClick={loadRequests} disabled={loading}>
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
          <CreditCard size={18} /> Approval Queue
        </h2>

        <div className="hr-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="hr-stat-card blue">
            <Clock className="hr-stat-icon" />
            <h4>Pending Requests</h4>
            <p>{pendingRequests.length}</p>
          </div>
          <div className="hr-stat-card green">
            <CheckCircle2 className="hr-stat-icon" />
            <h4>Approved</h4>
            <p>{requests.filter((request) => request.status === "APPROVED").length}</p>
          </div>
          <div className="hr-stat-card red">
            <CircleX className="hr-stat-icon" />
            <h4>Rejected</h4>
            <p>{requests.filter((request) => request.status === "REJECTED").length}</p>
          </div>
        </div>
      </section>

      <section className="hr-section">
        <h2>
          <Clock size={18} /> Pending Approval
        </h2>

        {loading ? (
          <div className="hr-loading">
            <RefreshCw className="spin" size={18} /> Loading replacement requests...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="hr-card" style={{ cursor: "default" }}>
            <h3>No pending replacement requests</h3>
            <p>When staff request a replacement after reporting a lost ID, HR approvals will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {pendingRequests.map((request) => (
              <article key={request.id} className="hr-card" style={{ cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{request.fullName}</h3>
                      <p>{request.email}</p>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                        Card: {request.cardNumber || "Not assigned"}
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
                        Requested {formatDate(request.createdAt)}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#1a3a6b", fontSize: 13 }}>Staff note</strong>
                      <p style={{ marginTop: 6 }}>
                        {request.notes?.trim() || "No replacement note was provided."}
                      </p>
                    </div>
                    {request.filePath && (
                      <a
                        href={`http://localhost/etms/${request.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#2563eb", fontWeight: 600, fontSize: 13 }}
                      >
                        View attachment
                      </a>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: 10, minWidth: 220, alignContent: "start" }}>
                    <button
                      type="button"
                      onClick={() => handleReview(request.id, "APPROVED")}
                      disabled={actingId === request.id}
                      style={{
                        border: "none",
                        borderRadius: 12,
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: actingId === request.id ? "not-allowed" : "pointer",
                        opacity: actingId === request.id ? 0.7 : 1,
                      }}
                    >
                      {actingId === request.id ? "Processing..." : "Approve replacement"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(request.id, "REJECTED")}
                      disabled={actingId === request.id}
                      style={{
                        border: "1px solid #fecaca",
                        borderRadius: 12,
                        padding: "12px 16px",
                        background: "#fff1f2",
                        color: "#b91c1c",
                        fontWeight: 700,
                        cursor: actingId === request.id ? "not-allowed" : "pointer",
                        opacity: actingId === request.id ? 0.7 : 1,
                      }}
                    >
                      Reject request
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
          <CheckCircle2 size={18} /> Reviewed Requests
        </h2>

        {reviewedRequests.length === 0 ? (
          <div className="hr-card" style={{ cursor: "default" }}>
            <h3>No reviewed requests yet</h3>
            <p>Approved and rejected replacement requests will stay here for HR reference.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {reviewedRequests.map((request) => {
              const tone = statusTone(request.status);

              return (
                <article key={request.id} className="hr-card" style={{ cursor: "default" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{request.fullName}</h3>
                      <p>{request.email}</p>
                      <p style={{ marginTop: 10 }}>
                        {request.notes?.trim() || "No replacement note was provided."}
                      </p>
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
                        Submitted {formatDate(request.createdAt)}
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
