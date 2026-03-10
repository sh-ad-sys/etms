"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";

import "@/styles/alerts.css";

type Alert = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  resolvedAt: string | null;
  status: "open" | "resolved";
};

type FilterType = "all" | "open" | "resolved";

const API = "http://localhost/etms/controllers/security";

export default function SecurityAlertsPage() {

  const [filter, setFilter]       = useState<FilterType>("all");
  const [alerts, setAlerts]       = useState<Alert[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [resolving, setResolving] = useState<string | null>(null);

  /* ================= FETCH ALERTS ================= */

  const fetchAlerts = useCallback(async (status: FilterType = "all") => {

    setLoading(true);
    setError("");

    try {

      const res = await fetch(`${API}/get-alerts.php?status=${status}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setAlerts(data.alerts || []);
      } else {
        setError(data.error || "Failed to load alerts.");
      }

    } catch (err) {
      console.error("Alert fetch error:", err);
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }

  }, []);

  /* Initial load */
  useEffect(() => {
    fetchAlerts(filter);
  }, [fetchAlerts, filter]);

  /* ================= MARK RESOLVED ================= */

  const markResolved = async (id: string) => {

    setResolving(id);

    try {

      const res = await fetch(`${API}/resolve-alert.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        /* Optimistic update — flip status locally */
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "resolved" } : a
          )
        );
      } else {
        setError(data.error || "Failed to resolve alert.");
      }

    } catch (err) {
      console.error("Resolve error:", err);
      setError("Unable to resolve alert. Please try again.");
    } finally {
      setResolving(null);
    }

  };

  /* ================= FILTER (client-side on cached data) ================= */

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.status === filter);

  /* ================= SEVERITY COUNTS ================= */

  const openCount     = alerts.filter((a) => a.status === "open").length;
  const highCount     = alerts.filter((a) => a.severity === "high" && a.status === "open").length;

  /* ================= RENDER ================= */

  return (
    <div className="alerts-page">

      {/* HEADER */}
      <div className="alerts-header">
        <h1>
          <ShieldAlert size={22} style={{ marginRight: 8 }} />
          Security Alerts
        </h1>
        <p>Dashboard / Security / Alerts</p>
      </div>

      {/* SUMMARY BADGES */}
      {!loading && !error && (
        <div className="alerts-summary">
          <span className="summary-badge badge-open">
            {openCount} Open
          </span>
          {highCount > 0 && (
            <span className="summary-badge badge-high">
              {highCount} High Severity
            </span>
          )}
        </div>
      )}

      {/* TOOLBAR */}
      <div className="alerts-toolbar">

        <div className="alerts-filter">
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
          >
            <option value="all">All Alerts</option>
            <option value="open">Open Alerts</option>
            <option value="resolved">Resolved Alerts</option>
          </select>
        </div>

        <button
          className="refresh-btn"
          onClick={() => fetchAlerts(filter)}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="alerts-error">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="alerts-loading">
          Loading alerts...
        </div>
      )}

      {/* ALERT LIST */}
      {!loading && (
        <div className="alerts-list">

          {filteredAlerts.map((alert) => (

            <div
              key={alert.id}
              className={`alert-card ${alert.status === "resolved" ? "alert-resolved" : ""}`}
            >

              {/* LEFT */}
              <div className="alert-left">

                <div className={`severity-indicator severity-${alert.severity}`}>
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <h3 className="alert-title">{alert.title}</h3>
                  <p className="alert-description">{alert.description}</p>

                  <div className="alert-meta">
                    <Clock size={14} />
                    {alert.timestamp}
                    {alert.resolvedAt && (
                      <span style={{ marginLeft: 10, color: "#22c55e" }}>
                        · Resolved {alert.resolvedAt}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT */}
              <div className="alert-right">

                <span className={`alert-status ${alert.status === "open" ? "status-open" : "status-resolved"}`}>
                  {alert.status === "open" ? "Open" : "Resolved"}
                </span>

                {alert.status === "open" && (
                  <button
                    onClick={() => markResolved(alert.id)}
                    className="resolve-btn"
                    disabled={resolving === alert.id}
                  >
                    <CheckCircle size={14} style={{ marginRight: 4 }} />
                    {resolving === alert.id ? "Resolving..." : "Mark as Resolved"}
                  </button>
                )}

              </div>

            </div>

          ))}

          {filteredAlerts.length === 0 && !error && (
            <div className="alerts-empty">
              No security alerts found.
            </div>
          )}

        </div>
      )}

    </div>
  );
}