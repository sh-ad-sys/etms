"use client";

import "@/styles/admin-login-activity.css";
import { useEffect, useMemo, useState } from "react";
import { Shield, Search, Laptop, Smartphone, Globe, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface LoginLog {
  id: number;
  user: string;
  email: string;
  device: string;
  deviceLabel: string;
  ip: string;
  location: string;
  status: "Success" | "Failed";
  time: string;
}

const API = "http://localhost/etms/controllers/admin";

export default function LoginActivityPage() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/get-login-activity.php`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to load login activity.");
          return;
        }
        setLogs(json.logs || []);
      } catch {
        setError("Unable to load login activity.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => logs.filter((log) =>
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.email.toLowerCase().includes(search.toLowerCase()) ||
    log.ip.toLowerCase().includes(search.toLowerCase()),
  ), [logs, search]);

  return (
    <div className="login-activity-container">
      <div className="login-header">
        <h1>
          <Shield size={28} /> Login Security Activity
        </h1>
        <p>Monitor authentication security events in real time</p>
      </div>

      <div className="login-search">
        <Search size={18} />
        <input
          placeholder="Search user or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="login-card">
        {loading ? (
          <div className="login-empty-state"><Loader2 size={18} className="spin" /> Loading activity...</div>
        ) : error ? (
          <div className="login-empty-state">{error}</div>
        ) : (
          <table className="login-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Device</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{log.user.charAt(0)}</div>
                      <div>
                        <p className="user-name">{log.user}</p>
                        <span className="email">{log.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="device-cell">
                    {log.device === "Desktop" && <Laptop size={16} />}
                    {log.device === "Laptop" && <Laptop size={16} />}
                    {(log.device === "Mobile" || log.device === "Tablet") && <Smartphone size={16} />}
                    {log.deviceLabel}
                  </td>

                  <td>{log.ip}</td>

                  <td className="location-cell">
                    <Globe size={15} />
                    {log.location}
                  </td>

                  <td>
                    <span className={`status ${log.status.toLowerCase()}`}>
                      {log.status === "Success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {log.status}
                    </span>
                  </td>

                  <td>{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="login-empty-state">No login activity found.</div>
        )}
      </div>
    </div>
  );
}
