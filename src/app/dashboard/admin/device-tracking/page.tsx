"use client";

import "@/styles/admin-device-tracking.css";
import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Globe,
  MapPin,
  Shield,
  Wifi,
  Activity,
} from "lucide-react";

interface DeviceTrack {
  id: number;
  device: string;
  type: string;
  ip: string;
  location: string;
  status: "Online" | "Offline" | "Suspicious";
  lastSeen: string;
}

export default function DeviceTrackingPage() {

  const [devices] = useState<DeviceTrack[]>([
    {
      id: 1,
      device: "Admin Office PC",
      type: "Desktop",
      ip: "192.168.1.10",
      location: "Nairobi, Kenya",
      status: "Online",
      lastSeen: "2 mins ago"
    },
    {
      id: 2,
      device: "HR Tablet",
      type: "Tablet",
      ip: "192.168.1.22",
      location: "Mombasa, Kenya",
      status: "Offline",
      lastSeen: "1 hour ago"
    },
    {
      id: 3,
      device: "Gate Biometric Scanner",
      type: "Biometric",
      ip: "192.168.1.30",
      location: "Factory Gate A",
      status: "Online",
      lastSeen: "Active Now"
    }
  ]);

  const onlineCount = devices.filter(d => d.status === "Online").length;
  const offlineCount = devices.filter(d => d.status === "Offline").length;
  const suspiciousCount = devices.filter(d => d.status === "Suspicious").length;

  return (
    <div className="device-tracking-container">

      {/* HEADER */}
      <div className="tracking-header">
        <h1>
          <Shield size={28}/>
          Device Tracking Center
        </h1>
        <p>Monitor all logged-in devices across the enterprise network</p>
      </div>

      {/* SUMMARY STATS */}
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

      {/* DEVICE TABLE */}
      <div className="tracking-table-card">

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

                {/* DEVICE NAME */}
                <td>
                  <div className="device-name-wrapper">
                    {getDeviceIcon(device.type)}
                    <span>{device.device}</span>
                  </div>
                </td>

                {/* TYPE */}
                <td>{device.type}</td>

                {/* IP */}
                <td>
                  <div className="cell-with-icon">
                    <Wifi size={14}/>
                    {device.ip}
                  </div>
                </td>

                {/* LOCATION */}
                <td>
                  <div className="cell-with-icon">
                    <MapPin size={14}/>
                    {device.location}
                  </div>
                </td>

                {/* STATUS */}
                <td>
                  <span className={`device-status ${device.status.toLowerCase()}`}>
                    <Activity size={12}/>
                    {device.status}
                  </span>
                </td>

                {/* LAST SEEN */}
                <td className="last-seen">
                  {device.lastSeen}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

function getDeviceIcon(type: string){
  if(type === "Desktop") return <Monitor size={18}/>;
  if(type === "Tablet") return <Smartphone size={18}/>;
  return <Globe size={18}/>;
}