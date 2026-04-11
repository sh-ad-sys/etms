"use client";

import "@/styles/admin-alerts.css";
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Search, Clock, UserX, Laptop } from "lucide-react";

interface AlertLog {
  id: number;
  user: string;
  ip: string;
  device: string;
  time: string;
  status: "Critical" | "Warning" | "Info";
  details?: string;
}

const API = "http://localhost/etms/controllers/admin";

export default function AdminAlertsPage() {
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API}/get-failed-login-alerts.php`, {
          credentials: "include",
        });

        if (res.status === 401) {
          setError("Session expired.");
          return;
        }

        const data = await res.json();
        if (data.success) {
          setAlerts(data.alerts ?? []);
        } else {
          setError(data.error || "Failed to load failed login alerts.");
        }
      } catch {
        setError("Unable to load failed login alerts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const filtered = useMemo(
    () => alerts.filter((alert) =>
      alert.user.toLowerCase().includes(search.toLowerCase()) ||
      alert.ip.toLowerCase().includes(search.toLowerCase()) ||
      alert.device.toLowerCase().includes(search.toLowerCase())
    ),
    [alerts, search]
  );

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h1>
          <ShieldAlert size={28} />
          Failed Login Alerts
        </h1>
        <p>Security monitoring center - Royal Mabati Factory</p>
      </div>

      <div className="alerts-search">
        <Search size={18} />
        <input
          placeholder="Search by user, IP, or device..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading failed login alerts...</div>
      ) : error ? (
        <div className="empty-state">{error}</div>
      ) : (
        <div className="alerts-list">
          {filtered.map((alert) => (
            <div key={alert.id} className="alert-card">
              <div className="alert-left">
                <UserX className="alert-icon" />

                <div>
                  <h3>{alert.user}</h3>

                  <div className="alert-meta">
                    <span>
                      <Laptop size={14} /> {alert.device}
                    </span>

                    <span>
                      <Clock size={14} /> {alert.time}
                    </span>
                  </div>

                  <div className="alert-meta alert-meta-secondary">
                    <span>IP: {alert.ip}</span>
                    {alert.details ? <span>{alert.details}</span> : null}
                  </div>
                </div>
              </div>

              <div className={`alert-badge ${alert.status.toLowerCase()}`}>
                {alert.status}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">No failed login alerts found</div>
          )}
        </div>
      )}
    </div>
  );
}
