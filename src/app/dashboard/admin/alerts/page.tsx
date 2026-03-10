"use client";

import "@/styles/admin-alerts.css";
import { useState } from "react";
import { ShieldAlert, Search, Clock, UserX, Laptop } from "lucide-react";

interface AlertLog {
  id: number;
  user: string;
  ip: string;
  device: string;
  time: string;
  status: "Critical" | "Warning" | "Info";
}

export default function AdminAlertsPage() {

  const [search, setSearch] = useState("");

  const [alerts] = useState<AlertLog[]>([
    {
      id: 1,
      user: "john.staff@royalmabati.co.ke",
      ip: "102.45.12.8",
      device: "Office Desktop",
      time: "2 mins ago",
      status: "Critical",
    },
    {
      id: 2,
      user: "hr.user@royalmabati.co.ke",
      ip: "41.90.12.7",
      device: "HR Tablet",
      time: "15 mins ago",
      status: "Warning",
    },
    {
      id: 3,
      user: "manager.user@royalmabati.co.ke",
      ip: "102.68.10.22",
      device: "Mobile Login",
      time: "1 hour ago",
      status: "Info",
    }
  ]);

  const filtered = alerts.filter(
    a =>
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.ip.includes(search)
  );

  return (
    <div className="alerts-container">

      {/* HEADER */}
      <div className="alerts-header">
        <h1>
          <ShieldAlert size={28}/>
          Failed Login Alerts
        </h1>
        <p>Security monitoring center • Royal Mabati Factory</p>
      </div>

      {/* SEARCH */}
      <div className="alerts-search">
        <Search size={18}/>
        <input
          placeholder="Search by user or IP..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>

      {/* ALERT LIST */}
      <div className="alerts-list">

        {filtered.map(alert => (
          <div key={alert.id} className="alert-card">

            <div className="alert-left">
              <UserX className="alert-icon"/>

              <div>
                <h3>{alert.user}</h3>

                <div className="alert-meta">
                  <span>
                    <Laptop size={14}/> {alert.device}
                  </span>

                  <span>
                    <Clock size={14}/> {alert.time}
                  </span>
                </div>
              </div>
            </div>

            <div className={`alert-badge ${alert.status.toLowerCase()}`}>
              {alert.status}
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            No security alerts found
          </div>
        )}

      </div>

    </div>
  );
}