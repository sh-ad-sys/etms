"use client";

import { useEffect, useState, useCallback } from "react";
import "@/styles/admin-health.css";
import {
  Server, Database, Activity, ShieldCheck,
  Cpu, HardDrive, MemoryStick, Loader2,
  RefreshCw, AlertTriangle, CheckCircle2,
  XCircle, Clock, Wifi,
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Types ─────────────────────────────────────────────── */

type Level = "good" | "warning" | "critical";

type HealthData = {
  server:   { status: string; phpVersion: string; software: string; uptimeStr: string };
  cpu:      { percent: number; status: Level };
  memory:   { percent: number; totalMB: number; phpUsedMB: number; phpPeakMB: number; status: Level };
  disk:     { percent: number; usedGB: number; totalGB: number; status: Level };
  database: { status: string; sizeMB: number; tableCount: number; connections: number; slowQueries: number };
  security: { status: string; level: Level; openAlerts: number };
  services: { name: string; status: string; detail: string }[];
  recentLogs: { level: string; message: string; detail: string; actor: string; time: string }[];
  generatedAt: string;
  date:        string;
};

const API = "http://localhost/etms/controllers/admin";

const LOG_COLORS: Record<string, string> = {
  INFO:    "log-info",
  SUCCESS: "log-success",
  WARN:    "log-warn",
  ERROR:   "log-error",
};

/* ─── Page ───────────────────────────────────────────────── */

export default function AdminHealthPage() {

  const [data,    setData]    = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/admin-health.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load health data.");
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Auto-refresh every 30 seconds */
  useEffect(() => {
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  if (loading && !data) return (
    <div className="health-loading"><Loader2 size={22} className="spin" /> Loading system health...</div>
  );
  if (error) return <div className="health-error"><AlertTriangle size={14} /> {error}</div>;
  if (!data) return null;

  const { server, cpu, memory, disk, database, security, services, recentLogs } = data;

  const serverLevel: Level = server.status === "Operational" ? "good"
    : server.status === "Warning" ? "warning" : "critical";

  return (
    <div className="admin-health-container">

      {/* HEADER */}
      <div className="admin-health-header">
        <div>
          <h1><Activity size={22} /> System Health & Monitoring</h1>
          <p>Real-time monitoring of Royal Mabati Factory ETMS · {data.date}</p>
        </div>
        <div className="health-header-right">
          <span className="health-updated"><Wifi size={11} /> {data.generatedAt}</span>
          <button className="health-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* STATUS OVERVIEW */}
      <div className="health-overview">
        <HealthCard
          icon={<Server size={24} />}
          title="Server Status"
          value={server.status}
          sub={server.software}
          level={serverLevel}
        />
        <HealthCard
          icon={<Database size={24} />}
          title="Database"
          value={database.status}
          sub={`${database.sizeMB} MB · ${database.tableCount} tables`}
          level="good"
        />
        <HealthCard
          icon={<ShieldCheck size={24} />}
          title="Security"
          value={security.status}
          sub={security.openAlerts > 0 ? `${security.openAlerts} open alerts` : "No active threats"}
          level={security.level}
        />
        <HealthCard
          icon={<Clock size={24} />}
          title="System Uptime"
          value={server.uptimeStr || "N/A"}
          sub={`PHP ${server.phpVersion}`}
          level="good"
        />
      </div>

      {/* RESOURCE MONITOR */}
      <div className="resource-section">

        <div className={`resource-card rc-${cpu.status}`}>
          <div className="resource-header">
            <Cpu size={20} />
            <h3>CPU Usage</h3>
            <span className={`resource-pct pct-${cpu.status}`}>{cpu.percent}%</span>
          </div>
          <ProgressBar value={cpu.percent} level={cpu.status} />
          <span className="resource-detail">
            {cpu.percent < 50 ? "Normal load" : cpu.percent < 80 ? "Moderate load" : "High load — monitor closely"}
          </span>
        </div>

        <div className={`resource-card rc-${memory.status}`}>
          <div className="resource-header">
            <MemoryStick size={20} />
            <h3>Memory Usage</h3>
            <span className={`resource-pct pct-${memory.status}`}>{memory.percent}%</span>
          </div>
          <ProgressBar value={memory.percent} level={memory.status} />
          <span className="resource-detail">
            {memory.totalMB > 0
              ? `${memory.totalMB} MB total · PHP using ${memory.phpUsedMB} MB`
              : `PHP using ${memory.phpUsedMB} MB (peak: ${memory.phpPeakMB} MB)`}
          </span>
        </div>

        <div className={`resource-card rc-${disk.status}`}>
          <div className="resource-header">
            <HardDrive size={20} />
            <h3>Storage Usage</h3>
            <span className={`resource-pct pct-${disk.status}`}>{disk.percent}%</span>
          </div>
          <ProgressBar value={disk.percent} level={disk.status} />
          <span className="resource-detail">
            {disk.totalGB > 0
              ? `${disk.usedGB} GB used of ${disk.totalGB} GB`
              : "Disk info unavailable"}
          </span>
        </div>

        <div className="resource-card rc-good">
          <div className="resource-header">
            <Database size={20} />
            <h3>Database</h3>
            <span className="resource-pct pct-good">{database.connections}</span>
          </div>
          <div className="db-detail-grid">
            <div className="db-detail-item">
              <span>Size</span><strong>{database.sizeMB} MB</strong>
            </div>
            <div className="db-detail-item">
              <span>Tables</span><strong>{database.tableCount}</strong>
            </div>
            <div className="db-detail-item">
              <span>Connections</span><strong>{database.connections}</strong>
            </div>
            <div className="db-detail-item">
              <span>Slow Queries</span>
              <strong className={database.slowQueries > 10 ? "text-warn" : ""}>
                {database.slowQueries}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* SERVICES */}
      <div className="services-section">
        <h2>System Services</h2>
        <div className="services-grid">
          {services.map(svc => (
            <ServiceItem key={svc.name} name={svc.name} status={svc.status} detail={svc.detail} />
          ))}
        </div>
      </div>

      {/* LOGS */}
      <div className="logs-section">
        <h2>Recent System Logs <span className="logs-count">{recentLogs.length} entries</span></h2>
        <div className="log-box">
          {recentLogs.length === 0 ? (
            <p className="log-empty">No recent log entries.</p>
          ) : recentLogs.map((log, i) => (
            <div key={i} className={`log-entry ${LOG_COLORS[log.level] ?? "log-info"}`}>
              <span className="log-level">[{log.level}]</span>
              <span className="log-msg">{log.message}</span>
              {log.detail && <span className="log-detail">{log.detail}</span>}
              <span className="log-meta">{log.actor} · {log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

function HealthCard({ icon, title, value, sub, level }: {
  icon: React.ReactNode; title: string; value: string;
  sub?: string; level: Level;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -3 }} className={`health-card hc-${level}`}>
      <div className="health-icon">{icon}</div>
      <div className="health-card-body">
        <p className="health-card-title">{title}</p>
        <h3 className="health-card-value">{value}</h3>
        {sub && <span className="health-card-sub">{sub}</span>}
      </div>
      <div className="health-card-indicator">
        {level === "good"     && <CheckCircle2 size={16} />}
        {level === "warning"  && <AlertTriangle size={16} />}
        {level === "critical" && <XCircle size={16} />}
      </div>
    </motion.div>
  );
}

function ProgressBar({ value, level }: { value: number; level: Level }) {
  return (
    <div className="progress-bar">
      <div className={`progress-fill pf-${level}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function ServiceItem({ name, status, detail }: { name: string; status: string; detail: string }) {
  return (
    <div className="service-item">
      <div className={`service-dot sd-${status}`} />
      <div className="service-body">
        <span className="service-name">{name}</span>
        <span className="service-detail">{detail}</span>
      </div>
      <span className={`service-status ss-${status}`}>{status}</span>
    </div>
  );
}