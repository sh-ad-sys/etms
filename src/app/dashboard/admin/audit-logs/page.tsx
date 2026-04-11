"use client";

import "@/styles/admin-audit-logs.css";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Search, Clock, User, Database, Loader2 } from "lucide-react";

interface AuditLog {
  id: number;
  user: string;
  action: string;
  module: string;
  ip: string;
  time: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

const API = "http://localhost/etms/controllers/admin";

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/get-audit-logs.php`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to load audit logs.");
          return;
        }
        setLogs(json.logs || []);
      } catch {
        setError("Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => logs.filter((log) =>
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.ip.toLowerCase().includes(search.toLowerCase()),
  ), [logs, search]);

  return (
    <div className="audit-container">
      <div className="audit-header">
        <h1>
          <ShieldCheck size={28} />
          Audit Activity Logs
        </h1>
        <p>System security audit trail • Royal Mabati Factory</p>
      </div>

      <div className="audit-search">
        <Search size={18} />
        <input
          placeholder="Search audit logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="audit-table-card">
        {loading ? (
          <div className="audit-empty"><Loader2 size={18} className="spin" /> Loading audit logs...</div>
        ) : error ? (
          <div className="audit-empty">{error}</div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Time</th>
                <th>Severity</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="audit-row">
                  <td className="audit-user">
                    <User size={16} />
                    {log.user}
                  </td>
                  <td>{log.action}</td>
                  <td className="audit-module">
                    <Database size={16} />
                    {log.module}
                  </td>
                  <td className="audit-ip">{log.ip}</td>
                  <td className="audit-time">
                    <Clock size={16} />
                    {log.time}
                  </td>
                  <td>
                    <span className={`audit-severity ${log.severity.toLowerCase()}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="audit-empty">No audit records found</div>
        )}
      </div>
    </div>
  );
}
