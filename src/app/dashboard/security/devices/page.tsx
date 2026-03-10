"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  Search
} from "lucide-react";

import "@/styles/devices.css";

type Device = {
  id: string;
  name: string;
  type: "desktop" | "mobile";
  ip: string;
  location: string;
  lastActive: string;
  status: "active" | "history";
  current: boolean;
};

export default function SecurityDevicesPage() {

  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH DEVICES ================= */

  useEffect(() => {

    const fetchDevices = async () => {

      try {

        const res = await fetch(
          "http://localhost/etms/controllers/security/get-devices.php",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (res.status === 401) {
          setError("Your session expired. Please login again.");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          setDevices(data.devices || []);
        } else {
          setError(data.error || "Failed to load devices");
        }

      } catch (err) {

        console.error("Device fetch error:", err);
        setError("Unable to load devices.");

      } finally {
        setLoading(false);
      }

    };

    fetchDevices();

  }, []);

  /* ================= FILTER ================= */

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= RENDER ================= */

  return (
    <div className="security-page">

      {/* HEADER */}
      <div className="security-header">
        <h1>
          <ShieldCheck size={22} style={{ marginRight: 8 }} />
          Device Security Management
        </h1>
        <p>Dashboard / Security / Logged-in Devices</p>
      </div>

      {/* SEARCH BAR */}
      <div className="security-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search device..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "20px"
          }}
        >
          {error}
        </div>
      )}

      {/* DEVICE LIST */}
      <div style={{ display: "grid", gap: "20px", marginTop: "30px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            Loading devices...
          </div>
        ) : (
          filteredDevices.map(device => (

            <div key={device.id} className="device-card">

              {/* LEFT SIDE */}
              <div className="device-info">

                <div className="device-icon">
                  {device.type === "desktop"
                    ? <Laptop size={20} />
                    : <Smartphone size={20} />}
                </div>

                <div>

                  <h3 className="device-name">

                    {device.name}

                    {device.current && (
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 12,
                          background: "#22c55e",
                          color: "#fff",
                          padding: "3px 8px",
                          borderRadius: 6
                        }}
                      >
                        Current Device
                      </span>
                    )}

                  </h3>

                  <div className="device-meta">

                    <div>
                      <Globe size={14} style={{ marginRight: 6 }} />
                      {device.ip} • {device.location}
                    </div>

                    <div>
                      <Clock size={14} style={{ marginRight: 6 }} />
                      Last Active: {device.lastActive}
                    </div>

                  </div>

                </div>

              </div>

              {/* RIGHT SIDE */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

                <span
                  className={`status-badge ${
                    device.current
                      ? "status-active"
                      : "status-history"
                  }`}
                >
                  {device.current ? "Active Now" : "Recent Device"}
                </span>

              </div>

            </div>

          ))
        )}

      </div>

      {/* EMPTY STATE */}
      {!loading && !error && filteredDevices.length === 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#64748b"
          }}
        >
          No devices found.
        </div>
      )}

    </div>
  );
}