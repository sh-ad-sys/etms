"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  FileWarning,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import "@/styles/hr.css";

type HRData = {
  idSummary: {
    active: number;
    lost: number;
    suspended: number;
    pending: number;
    pendingReplacements: number;
    pendingLostReports: number;
  };
  recentActivity: {
    source: string;
    title: string;
    description: string;
    actor: string;
    time: string;
  }[];
  generatedAt: string;
  date: string;
};

const API = "http://localhost/etms/controllers/hr/hr-dashboard.php";

export default function HRIdIssuanceTrackingPage() {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API, { credentials: "include" });
      if (res.status === 401) {
        setError("Session expired.");
        return;
      }

      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to load ID issuance data.");
      }
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activity = useMemo(
    () => (data?.recentActivity || []).filter((item) => item.source === "lost_id" || item.source === "id_replace"),
    [data]
  );

  const issuanceStages = [
    {
      title: "Reported",
      text: "Lost ID reports are logged and held for HR review.",
      icon: FileWarning,
      tone: "#fff7ed",
      color: "#c2410c",
    },
    {
      title: "Verified",
      text: "HR confirms the report and validates supporting details.",
      icon: ShieldCheck,
      tone: "#eff6ff",
      color: "#1d4ed8",
    },
    {
      title: "Reissued",
      text: "Replacement requests are approved and moved back to active status.",
      icon: CreditCard,
      tone: "#ecfdf5",
      color: "#047857",
    },
  ];

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <div>
          <h1 className="hr-title">ID Issuance Tracking</h1>
          <p className="hr-subtitle">Monitor the full ID lifecycle from lost-card report to verified replacement.</p>
        </div>
        <div className="hr-header-right">
          <button className="hr-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : undefined} />
          </button>
          <Link href="/dashboard/hr" className="hr-refresh-btn" style={{ textDecoration: "none" }}>
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>

      {error && <div className="hr-error">{error}</div>}

      {loading && !data ? (
        <div className="hr-loading">
          <Loader2 size={20} className="spin" /> Loading ID issuance records...
        </div>
      ) : data ? (
        <>
          <section className="hr-section">
            <h2><CreditCard size={18} /> Issuance Overview</h2>
            <div className="hr-id-summary">
              <div className="hr-id-stat id-active">
                <CheckCircle2 size={20} />
                <div><h4>{data.idSummary.active}</h4><p>Active IDs</p></div>
              </div>
              <div className="hr-id-stat id-pending">
                <Clock size={20} />
                <div><h4>{data.idSummary.pending}</h4><p>Pending Issuance</p></div>
              </div>
              <div className="hr-id-stat id-lost">
                <FileWarning size={20} />
                <div><h4>{data.idSummary.pendingLostReports}</h4><p>Lost Reports Awaiting HR</p></div>
              </div>
              <div className="hr-id-stat id-suspended">
                <CreditCard size={20} />
                <div><h4>{data.idSummary.pendingReplacements}</h4><p>Replacement Requests</p></div>
              </div>
            </div>
          </section>

          <section className="hr-section">
            <h2><ShieldCheck size={18} /> Issuance Workflow</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
              {issuanceStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.title} className="hr-card" style={{ cursor: "default", minHeight: 210 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 16, background: stage.tone, color: stage.color }}>
                        <Icon size={22} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.8 }}>
                        STEP {index + 1}
                      </span>
                    </div>
                    <h3 style={{ marginBottom: 10 }}>{stage.title}</h3>
                    <p>{stage.text}</p>
                    {index < issuanceStages.length - 1 && (
                      <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, color: "#2563eb", fontSize: 13, fontWeight: 700 }}>
                        Next <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="hr-section">
            <h2><FileWarning size={18} /> Recent ID Activity</h2>
            {activity.length === 0 ? (
              <div className="hr-card" style={{ cursor: "default" }}>
                <h3>No recent issuance activity</h3>
                <p>As HR reviews lost reports and replacement requests, the latest ID actions will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {activity.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="hr-card" style={{ cursor: "default" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
                        <p>{item.description || "No additional description provided."}</p>
                        {item.actor && <p style={{ marginTop: 10, color: "#2563eb", fontWeight: 600 }}>Handled by {item.actor}</p>}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
