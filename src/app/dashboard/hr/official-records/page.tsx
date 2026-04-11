"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, RefreshCw, ShieldCheck, Users } from "lucide-react";
import "@/styles/hr.css";

type HRData = {
  kpis: {
    totalEmployees: number;
    complianceScore: number;
  };
  generatedAt: string;
  date: string;
};

const API = "http://localhost/etms/controllers/hr/hr-dashboard.php";

export default function HROfficialRecordsPage() {
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
      else setError(json.error || "Failed to load official records.");
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <div>
          <h1 className="hr-title">Official Records</h1>
          <p className="hr-subtitle">Reference-ready workforce records for attendance, identity, and compliance review.</p>
        </div>
        <div className="hr-header-right">
          <button className="hr-refresh-btn" onClick={fetchData} disabled={loading}><RefreshCw size={14} className={loading ? "spin" : undefined} /></button>
          <Link href="/dashboard/hr" className="hr-refresh-btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} /></Link>
        </div>
      </div>

      {error && <div className="hr-error">{error}</div>}
      {loading && !data ? <div className="hr-loading"><Loader2 size={20} className="spin" /> Loading records...</div> : null}

      {data && (
        <>
          <section className="hr-section">
            <h2><FileText size={18} /> Records Snapshot</h2>
            <div className="hr-stats-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              <div className="hr-stat-card blue"><Users className="hr-stat-icon" /><h4>Tracked Employees</h4><p>{data.kpis.totalEmployees}</p></div>
              <div className="hr-stat-card green"><ShieldCheck className="hr-stat-icon" /><h4>Compliance Score</h4><p>{data.kpis.complianceScore}%</p></div>
            </div>
          </section>

          <section className="hr-section">
            <h2><ShieldCheck size={18} /> Record Coverage</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
              <div className="hr-card" style={{ cursor: "default" }}><h3>Attendance Logs</h3><p>Formal check-in and check-out records for payroll, compliance, and audit review.</p></div>
              <div className="hr-card" style={{ cursor: "default" }}><h3>ID Control</h3><p>Lost, suspended, pending, and replacement card records linked to each employee.</p></div>
              <div className="hr-card" style={{ cursor: "default" }}><h3>Policy Trace</h3><p>Support evidence for HR investigations, approvals, and workforce record verification.</p></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
