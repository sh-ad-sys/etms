"use client";

import "@/styles/admin-devices.css";
import { Monitor, Smartphone, Shield, Plus, Ban, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DeviceItem {
  id: number;
  name: string;
  type: string;
  ip: string;
  lastActive: string;
  status: "approved" | "pending" | "blocked";
  owner?: string;
}

const API = "http://localhost/etms/controllers/admin";

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/get-devices.php`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to load devices.");
          return;
        }
        setDevices(json.devices || []);
      } catch {
        setError("Unable to load device data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => ({
    approved: devices.filter((device) => device.status === "approved").length,
    pending: devices.filter((device) => device.status === "pending").length,
    blocked: devices.filter((device) => device.status === "blocked").length,
  }), [devices]);

  return (
    <div className="admin-devices-container">
      <div className="admin-devices-header">
        <h1>Device Restrictions &amp; Access Control</h1>
        <p>Manage approved devices, IP restrictions and secure system access</p>
      </div>

      <div className="devices-action-bar devices-summary-bar">
        <div className="devices-summary-chip">Approved {stats.approved}</div>
        <div className="devices-summary-chip pending-chip">Pending {stats.pending}</div>
        <div className="devices-summary-chip blocked-chip">Blocked {stats.blocked}</div>
        <button className="btn-primary" type="button" disabled>
          <Plus size={18} /> Register New Device
        </button>
      </div>

      <div className="devices-table-card">
        <h2>Registered Devices</h2>

        {loading ? (
          <div className="devices-empty-state"><Loader2 size={18} className="spin" /> Loading devices...</div>
        ) : error ? (
          <div className="devices-empty-state">{error}</div>
        ) : devices.length === 0 ? (
          <div className="devices-empty-state">No registered devices found.</div>
        ) : (
          <table className="devices-table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="device-name-cell">
                    {getIcon(device.type)}
                    <div className="device-meta-copy">
                      <span>{device.name}</span>
                      {device.owner && <small>{device.owner}</small>}
                    </div>
                  </td>
                  <td>{device.type}</td>
                  <td>{device.ip}</td>
                  <td>{device.lastActive}</td>
                  <td>
                    <span className={`status-badge ${device.status}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    {device.status === "pending" && (
                      <button className="approve-btn" type="button" aria-label="Pending device">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button className="block-btn" type="button" aria-label="Restricted device">
                      <Ban size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case "Desktop":
    case "Laptop":
      return <Monitor size={16} />;
    case "Tablet":
    case "Mobile":
      return <Smartphone size={16} />;
    case "Biometric":
      return <Shield size={16} />;
    default:
      return <Monitor size={16} />;
  }
}
