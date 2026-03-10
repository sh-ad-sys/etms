"use client";

import "@/styles/hr-attendance.css";

import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export default function HRAttendancePage() {

  const stats = {
    totalStaff: 245,
    present: 198,
    late: 32,
    absent: 15,
    attendanceRate: 92,
  };

  const attendanceRecords = [
    {
      name: "John Mwangi",
      department: "Production",
      checkIn: "08:05 AM",
      status: "Present",
    },
    {
      name: "Grace Achieng",
      department: "HR",
      checkIn: "08:30 AM",
      status: "Late",
    },
    {
      name: "Peter Otieno",
      department: "Warehouse",
      checkIn: "-",
      status: "Absent",
    },
  ];

  return (
    <div className="hr-attendance-container">

      {/* HEADER */}
      <div className="hr-attendance-header">
        <div>
          <h1>HR Attendance Monitoring</h1>
          <p>Royal Mabati Factory Workforce Tracking System</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="attendance-kpi-grid">

        <div className="attendance-kpi-card">
          <Users size={24} />
          <div>
            <h3>{stats.totalStaff}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div className="attendance-kpi-card success">
          <CheckCircle size={24} />
          <div>
            <h3>{stats.present}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="attendance-kpi-card warning">
          <Clock size={24} />
          <div>
            <h3>{stats.late}</h3>
            <p>Late Arrivals</p>
          </div>
        </div>

        <div className="attendance-kpi-card danger">
          <AlertTriangle size={24} />
          <div>
            <h3>{stats.absent}</h3>
            <p>Absent</p>
          </div>
        </div>

        <div className="attendance-kpi-card blue">
          <TrendingUp size={24} />
          <div>
            <h3>{stats.attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="attendance-table-card">
        <h2>Today Workforce Attendance</h2>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check In</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendanceRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.name}</td>
                <td>{record.department}</td>
                <td>{record.checkIn}</td>
                <td>
                  <span className={`status ${record.status.toLowerCase()}`}>
                    {record.status}
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