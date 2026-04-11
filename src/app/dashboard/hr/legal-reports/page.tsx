"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileCheck, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import "@/styles/hr.css";

type HRData = {
  kpis: {
    complianceScore: number;
    activeCases: number;
  };
  idSummary: {
    pendingReplacements: number;
    pendingLostReports: number;
  };
};

const API = "http://localhost/etms/controllers/hr/hr-dashboard.php";

export default function HRLegalReportsPage() {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API, { credentials: "include" });
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load legal reports data.");
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reportCards = useMemo(
    () => [
      {
        title: "Compliance Readiness",
        value: data ? `${data.kpis.complianceScore}%` : "--",
        text: "Current workforce compliance strength based on live HR dashboard metrics.",
      },
      {
        title: "Pending Replacement Cases",
        value: data ? `${data.idSummary.pendingReplacements}` : "--",
        text: "Replacement requests still waiting for HR handling before completion.",
      },
      {
        title: "Lost Report Cases",
        value: data ? `${data.idSummary.pendingLostReports}` : "--",
        text: "Lost-card incidents that should be included in compliance-ready reporting.",
      },
    ],
    [data]
  );

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <div>
          <h1 className="hr-title">Legal Reports</h1>
          <p className="hr-subtitle">Prepare HR records and compliance insights for formal reporting and audit follow-up.</p>
        </div>
        <div className="hr-header-right">
          <button className="hr-refresh-btn" onClick={fetchData} disabled={loading}><RefreshCw size={14} className={loading ? "spin" : undefined} /></button>
          <Link href="/dashboard/hr" className="hr-refresh-btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} /></Link>
        </div>
      </div>

      {error && <div className="hr-error">{error}</div>}
      {loading && !data ? <div className="hr-loading"><Loader2 size={20} className="spin" /> Loading report data...</div> : null}

      {data && (
        <>
          <section className="hr-section">
            <h2><FileCheck size={18} /> Reporting Snapshot</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
              {reportCards.map((card) => (
                <div key={card.title} className="hr-card" style={{ cursor: "default" }}>
                  <div style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 16, background: "#eff6ff", color: "#1d4ed8", marginBottom: 16 }}>
                    <FileCheck size={22} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>{card.title.toUpperCase()}</p>
                  <h3 style={{ fontSize: 30, marginBottom: 8 }}>{card.value}</h3>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="hr-section">
            <h2><ShieldCheck size={18} /> Suggested Report Pack</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
              <div className="hr-card" style={{ cursor: "default" }}><h3>Attendance Evidence</h3><p>Use attendance records, exceptions, and audit logs to support every compliance report.</p></div>
              <div className="hr-card" style={{ cursor: "default" }}><h3>ID Control Summary</h3><p>Include lost card cases, replacement approvals, and active card counts in formal HR reporting.</p></div>
              <div className="hr-card" style={{ cursor: "default" }}><h3>Review Notes</h3><p>Capture final HR comments and action history before publishing any compliance-ready output.</p></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
