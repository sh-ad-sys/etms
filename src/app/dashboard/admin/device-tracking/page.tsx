"use client";

import "@/styles/admin-device-tracking.css";
import { useEffect, useMemo, useState } from "react";
import { Monitor, Smartphone, Globe, MapPin, Shield, Wifi, Activity, Loader2 } from "lucide-react";

interface DeviceTrack {
  id: number;
  name: string;
  type: string;
  ip: string;
  location: string;
  trackingStatus: "Online" | "Offline" | "Suspicious";
  lastActive: string;
}

const API = "http://localhost/etms/controllers/admin";

export default function DeviceTrackingPage() {
  const [devices, setDevices] = useState<DeviceTrack[]>([]);
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
          setError(json.error || "Failed to load tracked devices.");
          return;
        }
        setDevices((json.devices || []).map((device: any) => ({
          id: device.id,
          name: device.name,
          type: device.type,
          ip: device.ip,
          location: device.location,
          trackingStatus: device.trackingStatus || "Offline",
          lastActive: device.lastActive,
        })));
      } catch {
        setError("Unable to load tracked devices.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onlineCount = useMemo(() => devices.filter((d) => d.trackingStatus === "Online").length, [devices]);
  const offlineCount = useMemo(() => devices.filter((d) => d.trackingStatus === "Offline").length, [devices]);
  const suspiciousCount = useMemo(() => devices.filter((d) => d.trackingStatus === "Suspicious").length, [devices]);

  return (
    <div className="device-tracking-container">
      <div className="tracking-header">
        <h1>
          <Shield size={28} />
          Device Tracking Center
        </h1>
        <p>Monitor all logged-in devices across the enterprise network</p>
      </div>

      <div className="tracking-summary">
        <div className="summary-card online">
          <h3>Online Devices</h3>
          <p>{onlineCount}</p>
        </div>

        <div className="summary-card offline">
          <h3>Offline Devices</h3>
          <p>{offlineCount}</p>
        </div>

        <div className="summary-card suspicious">
          <h3>Suspicious Activity</h3>
          <p>{suspiciousCount}</p>
        </div>
      </div>

      <div className="tracking-table-card">
        {loading ? (
          <div className="tracking-empty-state"><Loader2 size={18} className="spin" /> Loading devices...</div>
        ) : error ? (
          <div className="tracking-empty-state">{error}</div>
        ) : (
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Status</th>
                <th>Last Seen</th>
              </tr>
            </thead>

            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className="device-table-row">
                  <td>
                    <div className="device-name-wrapper">
                      {getDeviceIcon(device.type)}
                      <span>{device.name}</span>
                    </div>
                  </td>
                  <td>{device.type}</td>
                  <td>
                    <div className="cell-with-icon">
                      <Wifi size={14} />
                      {device.ip}
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <MapPin size={14} />
                      {device.location}
                    </div>
                  </td>
                  <td>
                    <span className={`device-status ${device.trackingStatus.toLowerCase()}`}>
                      <Activity size={12} />
                      {device.trackingStatus}
                    </span>
                  </td>
                  <td className="last-seen">{device.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="tracking-empty-state">No tracked devices found.</div>
        )}
      </div>
    </div>
  );
}

function getDeviceIcon(type: string) {
  if (type === "Desktop" || type === "Laptop") return <Monitor size={18} />;
  if (type === "Tablet" || type === "Mobile") return <Smartphone size={18} />;
  return <Globe size={18} />;
}
