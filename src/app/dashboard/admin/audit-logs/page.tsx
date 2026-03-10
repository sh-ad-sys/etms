"use client";

import "@/styles/admin-audit-logs.css";
import { useState } from "react";
import { ShieldCheck, Search, Clock, User, Database } from "lucide-react";

interface AuditLog {
  id: number;
  user: string;
  action: string;
  module: string;
  ip: string;
  time: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export default function AuditLogsPage() {

  const [search, setSearch] = useState("");

  const [logs] = useState<AuditLog[]>([
    {
      id: 1,
      user: "admin@royalmabati.co.ke",
      action: "Deleted User Account",
      module: "User Management",
      ip: "102.45.10.8",
      time: "2 mins ago",
      severity: "High",
    },
    {
      id: 2,
      user: "hr@royalmabati.co.ke",
      action: "Updated Attendance Record",
      module: "Attendance",
      ip: "41.90.12.7",
      time: "20 mins ago",
      severity: "Medium",
    },
    {
      id: 3,
      user: "manager@royalmabati.co.ke",
      action: "Viewed Salary Report",
      module: "Finance",
      ip: "102.68.11.5",
      time: "1 hour ago",
      severity: "Low",
    }
  ]);

  const filtered = logs.filter(
    log =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.includes(search)
  );

  return (
    <div className="audit-container">

      {/* HEADER */}
      <div className="audit-header">
        <h1>
          <ShieldCheck size={28}/>
          Audit Activity Logs
        </h1>
        <p>System security audit trail • Royal Mabati Factory</p>
      </div>

      {/* SEARCH */}
      <div className="audit-search">
        <Search size={18}/>
        <input
          placeholder="Search audit logs..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>

      {/* LOG TABLE */}
      <div className="audit-table-card">

        <table className="audit-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>IP Address</th>
              <th>Time</th>
              <th>Severity</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="audit-row">

                <td className="audit-user">
                  <User size={16}/>
                  {log.user}
                </td>

                <td>{log.action}</td>

                <td className="audit-module">
                  <Database size={16}/>
                  {log.module}
                </td>

                <td className="audit-ip">
                  {log.ip}
                </td>

                <td className="audit-time">
                  <Clock size={16}/>
                  {log.time}
                </td>

                <td>
                  <span className={`audit-severity ${log.severity.toLowerCase()}`}>
                    {log.severity}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="audit-empty">
            No audit records found
          </div>
        )}

      </div>

    </div>
  );
}