"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck, Laptop, Smartphone,
  Globe, Clock, Search,
} from "lucide-react";
import "@/styles/devices.css";

type Device = {
  id:         string;
  name:       string;
  type:       "desktop" | "mobile";
  ip:         string;
  location:   string;
  lastActive: string;
  status:     "active" | "history";
  current:    boolean;
};

export default function SecurityDevicesPage() {

  const [search,  setSearch]  = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res  = await fetch(
          "http://localhost/etms/controllers/security/get-devices.php",
          { method: "GET", credentials: "include" }
        );
        if (res.status === 401) {
          setError("Your session expired. Please login again."); return;
        }
        const data = await res.json();
        if (data.success) setDevices(data.devices || []);
        else setError(data.error || "Failed to load devices");
      } catch (err) {
        console.error("Device fetch error:", err);
        setError("Unable to load devices.");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const filteredDevices = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="security-page">

      {/* HEADER */}
      <div className="security-header">
        <h1><ShieldCheck size={22} /> Device Security Management</h1>
        <p>Dashboard / Security / Logged-in Devices</p>
      </div>

      {/* SEARCH */}
      <div className="security-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search device..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ERROR */}
      {error && <div className="security-error">{error}</div>}

      {/* DEVICE LIST */}
      <div className="device-list">
        {loading ? (
          <div className="device-loading">Loading devices...</div>
        ) : (
          filteredDevices.map(device => (
            <div
              key={device.id}
              className={`device-card ${device.current ? "device-current" : ""}`}
            >
              {/* LEFT */}
              <div className="device-info">
                <div className="device-icon">
                  {device.type === "desktop"
                    ? <Laptop size={20} />
                    : <Smartphone size={20} />
                  }
                </div>

                <div>
                  <h3 className="device-name">
                    {device.name}
                    {device.current && (
                      <span className="current-pill">Current Device</span>
                    )}
                  </h3>

                  <div className="device-meta">
                    <div>
                      <Globe size={13} />
                      {device.ip} · {device.location}
                    </div>
                    <div>
                      <Clock size={13} />
                      Last Active: {device.lastActive}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="device-right">
                <span className={`status-badge ${device.current ? "status-active" : "status-history"}`}>
                  {device.current ? "Active Now" : "Recent Device"}
                </span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* EMPTY */}
      {!loading && !error && filteredDevices.length === 0 && (
        <div className="device-empty">No devices found.</div>
      )}

    </div>
  );
}