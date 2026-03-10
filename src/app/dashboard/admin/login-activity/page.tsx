"use client";

import "@/styles/admin-login-activity.css";
import { useState } from "react";
import { Shield, Search, Laptop, Smartphone, Globe, CheckCircle, XCircle } from "lucide-react";

interface LoginLog {
  id: number;
  user: string;
  email: string;
  device: string;
  ip: string;
  location: string;
  status: "Success" | "Failed";
  time: string;
}

export default function LoginActivityPage() {

  const [search, setSearch] = useState("");

  const [logs] = useState<LoginLog[]>([
    {
      id: 1,
      user: "John Mwangi",
      email: "john@royalmabati.co.ke",
      device: "Desktop",
      ip: "192.168.1.20",
      location: "Nairobi, Kenya",
      status: "Success",
      time: "2 mins ago"
    },
    {
      id: 2,
      user: "Grace Achieng",
      email: "grace@royalmabati.co.ke",
      device: "Mobile",
      ip: "192.168.1.31",
      location: "Mombasa, Kenya",
      status: "Failed",
      time: "10 mins ago"
    },
    {
      id: 3,
      user: "Peter Otieno",
      email: "peter@royalmabati.co.ke",
      device: "Laptop",
      ip: "192.168.1.44",
      location: "Kisumu, Kenya",
      status: "Success",
      time: "30 mins ago"
    }
  ]);

  const filtered = logs.filter(log =>
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="login-activity-container">

      {/* HEADER */}
      <div className="login-header">
        <h1>
          <Shield size={28}/> Login Security Activity
        </h1>
        <p>Monitor authentication security events in real time</p>
      </div>

      {/* SEARCH */}
      <div className="login-search">
        <Search size={18}/>
        <input
          placeholder="Search user or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="login-card">

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
            {filtered.map(log => (
              <tr key={log.id}>

                <td>
                  <div className="user-cell">
                    <div className="avatar">
                      {log.user.charAt(0)}
                    </div>
                    <div>
                      <p className="user-name">{log.user}</p>
                      <span className="email">{log.email}</span>
                    </div>
                  </div>
                </td>

                <td className="device-cell">
                  {log.device === "Desktop" && <Laptop size={16}/>}
                  {log.device === "Mobile" && <Smartphone size={16}/>}
                  {log.device === "Laptop" && <Laptop size={16}/>}
                  {log.device}
                </td>

                <td>{log.ip}</td>

                <td className="location-cell">
                  <Globe size={15}/>
                  {log.location}
                </td>

                <td>
                  <span className={`status ${log.status.toLowerCase()}`}>
                    {log.status === "Success"
                      ? <CheckCircle size={14}/>
                      : <XCircle size={14}/>
                    }
                    {log.status}
                  </span>
                </td>

                <td>{log.time}</td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}