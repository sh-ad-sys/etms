"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import "@/styles/hr.css";

type HRData = {
  employmentStatus: Record<string, number>;
  kpis: {
    totalEmployees: number;
    activeCases: number;
    violations: number;
    complianceScore: number;
  };
};

const API = "http://localhost/etms/controllers/hr/hr-dashboard.php";

type StatusKey = "ACTIVE" | "SUSPENDED" | "EXITED" | string;

function statusTone(status: StatusKey) {
  if (status === "ACTIVE") {
    return {
      badgeClass: "emp-active",
      surfaceClass: "status-surface-active",
      icon: CheckCircle2,
      label: "Active Workforce",
      copy: "Employees currently active in the organization and available within the workforce register.",
    };
  }

  if (status === "SUSPENDED") {
    return {
      badgeClass: "emp-suspended",
      surfaceClass: "status-surface-suspended",
      icon: Clock,
      label: "Suspended Employees",
      copy: "Employees temporarily restricted or under review and not in active operational deployment.",
    };
  }

  return {
    badgeClass: "emp-exited",
    surfaceClass: "status-surface-exited",
    icon: XCircle,
    label: "Exited Employees",
    copy: "Employees who have already exited service and remain in records for continuity and compliance.",
  };
}

function formatStatusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function HREmploymentStatusPage() {
  const [data, setData] = useState<HRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to load employment status.");
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

  const rows = useMemo(() => {
    return Object.entries(data?.employmentStatus || {}).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const totalTracked = useMemo(() => {
    return rows.reduce((sum, [, count]) => sum + count, 0);
  }, [rows]);

  const activeCount = data?.employmentStatus?.ACTIVE ?? 0;
  const suspendedCount = data?.employmentStatus?.SUSPENDED ?? 0;
  const exitedCount = data?.employmentStatus?.EXITED ?? 0;

  const activeRate = totalTracked > 0 ? Math.round((activeCount / totalTracked) * 100) : 0;
  const suspendedRate = totalTracked > 0 ? Math.round((suspendedCount / totalTracked) * 100) : 0;
  const exitedRate = totalTracked > 0 ? Math.round((exitedCount / totalTracked) * 100) : 0;

  if (loading && !data) {
    return (
      <div className="hr-loading">
        <Loader2 size={20} className="spin" /> Loading employment status...
      </div>
    );
  }

  return (
    <div className="hr-dashboard hr-employment-page">
      <div className="hr-header hr-employment-hero">
        <div>
          <h1 className="hr-title">Employment Status</h1>
          <p className="hr-subtitle">
            A live HR view of active, suspended, and exited employees with workforce health context.
          </p>
        </div>
      </div>

      {error && <div className="hr-error">{error}</div>}

      {data ? (
        <>
          <section className="employment-spotlight-grid">
            <div className="employment-hero-card">
              <div className="employment-hero-top">
                <div className="employment-hero-icon">
                  <Briefcase size={22} />
                </div>
                <span className="employment-hero-pill">HR Workforce Monitor</span>
              </div>
              <h2>{totalTracked}</h2>
              <p>Total employees tracked across all employment states in the current HR records.</p>
              <div className="employment-hero-metrics">
                <div>
                  <strong>{activeRate}%</strong>
                  <span>Active</span>
                </div>
                <div>
                  <strong>{suspendedRate}%</strong>
                  <span>Suspended</span>
                </div>
                <div>
                  <strong>{exitedRate}%</strong>
                  <span>Exited</span>
                </div>
              </div>
            </div>

            <div className="employment-kpi-stack">
              <div className="employment-mini-card">
                <Users size={18} />
                <div>
                  <strong>{data.kpis.totalEmployees}</strong>
                  <span>Active employees in live workforce count</span>
                </div>
              </div>
              <div className="employment-mini-card">
                <AlertTriangle size={18} />
                <div>
                  <strong>{data.kpis.activeCases}</strong>
                  <span>Open HR cases linked to workforce review</span>
                </div>
              </div>
              <div className="employment-mini-card">
                <ShieldCheck size={18} />
                <div>
                  <strong>{data.kpis.complianceScore}%</strong>
                  <span>Current compliance health indicator</span>
                </div>
              </div>
              <div className="employment-mini-card">
                <TrendingUp size={18} />
                <div>
                  <strong>{data.kpis.violations}</strong>
                  <span>Attendance-related workforce violations</span>
                </div>
              </div>
            </div>
          </section>

          <section className="hr-section employment-breakdown-section">
            <h2><Users size={18} /> Status Breakdown</h2>
            <div className="employment-status-grid">
              {rows.map(([status, count]) => {
                const tone = statusTone(status);
                const Icon = tone.icon;
                const ratio = totalTracked > 0 ? Math.round((count / totalTracked) * 100) : 0;

                return (
                  <div key={status} className={`employment-status-card ${tone.surfaceClass}`}>
                    <div className="employment-status-head">
                      <div className={`hr-emp-badge ${tone.badgeClass}`}>
                        <Icon size={14} />
                        <span>{formatStatusLabel(status)}</span>
                      </div>
                      <span className="employment-status-rate">{ratio}% of workforce</span>
                    </div>

                    <div className="employment-status-main">
                      <h3>{count}</h3>
                      <p>{tone.label}</p>
                    </div>

                    <div className="employment-progress-track">
                      <div className="employment-progress-fill" style={{ width: `${ratio}%` }} />
                    </div>

                    <p className="employment-status-copy">{tone.copy}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="hr-section employment-insight-section">
            <h2><ShieldCheck size={18} /> Related HR Context</h2>
            <div className="employment-context-grid">
              <div className="employment-context-card">
                <h3>Workforce Stability</h3>
                <p>
                  Active employees currently account for <strong>{activeRate}%</strong> of the tracked workforce,
                  giving HR a quick signal on staffing stability and operational continuity.
                </p>
              </div>
              <div className="employment-context-card">
                <h3>Suspension Watch</h3>
                <p>
                  Suspended records account for <strong>{suspendedCount}</strong> employees. This is useful for
                  case follow-up, disciplinary review, and return-to-work planning.
                </p>
              </div>
              <div className="employment-context-card">
                <h3>Exit Record Oversight</h3>
                <p>
                  Exited employee records remain important for audit history, compliance evidence, and previous
                  employment verification across HR workflows.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}

      <style jsx>{`
        .hr-employment-page {
          gap: 24px;
        }

        .hr-employment-hero {
          border-bottom: none;
          padding-bottom: 0;
        }

        .employment-spotlight-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 18px;
        }

        .employment-hero-card,
        .employment-mini-card,
        .employment-status-card,
        .employment-context-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(26, 58, 107, 0.08);
        }

        .employment-hero-card {
          padding: 24px;
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 58%, #f8fafc 100%);
        }

        .employment-hero-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .employment-hero-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #1d4ed8;
          color: #fff;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
        }

        .employment-hero-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .employment-hero-card h2 {
          margin: 0;
          font-size: 56px;
          line-height: 1;
          color: #0f172a;
        }

        .employment-hero-card > p {
          margin: 12px 0 0;
          max-width: 560px;
          color: #64748b;
          line-height: 1.7;
        }

        .employment-hero-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 24px;
        }

        .employment-hero-metrics div {
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid #dbeafe;
        }

        .employment-hero-metrics strong {
          display: block;
          margin-bottom: 6px;
          font-size: 22px;
          color: #1a3a6b;
        }

        .employment-hero-metrics span {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .employment-kpi-stack {
          display: grid;
          gap: 14px;
        }

        .employment-mini-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
        }

        .employment-mini-card :global(svg) {
          color: #1d4ed8;
          flex-shrink: 0;
        }

        .employment-mini-card strong {
          display: block;
          font-size: 24px;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .employment-mini-card span {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .employment-breakdown-section,
        .employment-insight-section {
          margin-top: 0;
        }

        .employment-status-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .employment-status-card {
          padding: 20px;
        }

        .status-surface-active {
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 72%);
        }

        .status-surface-suspended {
          background: linear-gradient(180deg, #fffbeb 0%, #ffffff 72%);
        }

        .status-surface-exited {
          background: linear-gradient(180deg, #fff1f2 0%, #ffffff 72%);
        }

        .employment-status-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .employment-status-rate {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .employment-status-main h3 {
          margin: 0 0 6px;
          font-size: 40px;
          line-height: 1;
          color: #0f172a;
        }

        .employment-status-main p {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #1a3a6b;
        }

        .employment-progress-track {
          width: 100%;
          height: 10px;
          margin: 18px 0 14px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.18);
          overflow: hidden;
        }

        .employment-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2563eb, #1a3a6b);
        }

        .employment-status-copy {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.65;
        }

        .employment-context-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .employment-context-card {
          padding: 20px;
        }

        .employment-context-card h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: #1a3a6b;
        }

        .employment-context-card p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        @media (max-width: 1024px) {
          .employment-spotlight-grid,
          .employment-status-grid,
          .employment-context-grid {
            grid-template-columns: 1fr;
          }

          .employment-hero-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default HREmploymentStatusPage;
