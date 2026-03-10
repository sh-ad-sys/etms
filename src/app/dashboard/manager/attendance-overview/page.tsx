"use client";

import { useState } from "react";
import "@/styles/manager-attendance-overview.css";
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Search,
} from "lucide-react";

type AttendanceStatus = "Present" | "Late" | "Absent" | "On Leave";

interface AttendanceRecord {
  id: number;
  name: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

const mockData: AttendanceRecord[] = [
  {
    id: 1,
    name: "John Kamau",
    department: "Production",
    checkIn: "08:02 AM",
    checkOut: "05:01 PM",
    status: "Present",
  },
  {
    id: 2,
    name: "Peter Otieno",
    department: "Warehouse",
    checkIn: "08:35 AM",
    checkOut: "05:10 PM",
    status: "Late",
  },
  {
    id: 3,
    name: "Mary Wanjiku",
    department: "Finance",
    checkIn: "--",
    checkOut: "--",
    status: "Absent",
  },
];

export default function ManagerAttendanceOverview() {
  const [search, setSearch] = useState("");

  const filtered = mockData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalEmployees = mockData.length;
  const present = mockData.filter((i) => i.status === "Present").length;
  const late = mockData.filter((i) => i.status === "Late").length;
  const absent = mockData.filter((i) => i.status === "Absent").length;

  return (
    <div className="manager-overview-container">
      {/* HEADER */}
      <div className="manager-header">
        <h1>Attendance Overview</h1>
        <p>Monitor workforce attendance across departments</p>
      </div>

      {/* KPI CARDS */}
      <div className="manager-kpi-grid">
        <div className="manager-kpi-card">
          <Users size={22} />
          <div>
            <span>Total Employees</span>
            <h3>{totalEmployees}</h3>
          </div>
        </div>

        <div className="manager-kpi-card present">
          <Clock size={22} />
          <div>
            <span>Present Today</span>
            <h3>{present}</h3>
          </div>
        </div>

        <div className="manager-kpi-card late">
          <TrendingUp size={22} />
          <div>
            <span>Late Arrivals</span>
            <h3>{late}</h3>
          </div>
        </div>

        <div className="manager-kpi-card absent">
          <AlertTriangle size={22} />
          <div>
            <span>Absent</span>
            <h3>{absent}</h3>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="manager-search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="manager-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.department}</td>
                <td>{item.checkIn}</td>
                <td>{item.checkOut}</td>
                <td>
                  <span
                    className={`status-badge ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}