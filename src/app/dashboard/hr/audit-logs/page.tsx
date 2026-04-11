"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, ClipboardCheck, CreditCard, FileWarning, Loader2, RefreshCw } from "lucide-react";
import "@/styles/hr.css";

type Activity = {
  source: string;
  title: string;
  description: string;
  actor: string;
  time: string;
};

type HRData = {
  recentActivity: Activity[];
};

const API = "http://localhost/etms/controllers/hr/hr-dashboard.php";

export default function HRAuditLogsPage() {
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
      else setError(json.error || "Failed to load audit logs.");
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const iconFor = useCallback((source: string) => {
    if (source === "audit") return <ClipboardCheck size={16} />;
    if (source === "lost_id") return <FileWarning size={16} />;
    if (source === "id_replace") return <CreditCard size={16} />;
    return <Bell size={16} />;
  }, []);

  const activities = useMemo(() => data?.recentActivity || [], [data]);

  return (
    <div className="hr-dashboard">
      <div className="hr-header">
        <div>
          <h1 className="hr-title">Audit Logs</h1>
          <p className="hr-subtitle">Track HR edits, approvals, and system actions in one place.</p>
        </div>
        <div className="hr-header-right">
          <button className="hr-refresh-btn" onClick={fetchData} disabled={loading}><RefreshCw size={14} className={loading ? "spin" : undefined} /></button>
          <Link href="/dashboard/hr" className="hr-refresh-btn" style={{ textDecoration: "none" }}><ArrowLeft size={14} /></Link>
        </div>
      </div>

      {error && <div className="hr-error">{error}</div>}
      {loading && !data ? <div className="hr-loading"><Loader2 size={20} className="spin" /> Loading audit logs...</div> : null}

      {data && (
        <section className="hr-section">
          <h2><ClipboardCheck size={18} /> Activity Stream</h2>
          <div className="hr-timeline">
            {activities.length === 0 ? (
              <p className="hr-timeline-empty">No audit activity available.</p>
            ) : activities.map((item, index) => (
              <div key={`${item.title}-${index}`} className={`hr-timeline-item hr-tl-${item.source}`}>
                <span className="hr-tl-icon">{iconFor(item.source)}</span>
                <div className="hr-tl-content">
                  <strong>{item.title}</strong>
                  {item.description && <span>{item.description}</span>}
                  {item.actor && <span className="hr-tl-actor">by {item.actor}</span>}
                </div>
                <span className="hr-tl-time">{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
