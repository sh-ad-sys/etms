"use client";

import "@/styles/admin-shifts.css";
import { Clock, CalendarDays, Plus, Settings, Timer } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState([
    {
      name: "Morning Shift",
      start: "08:00",
      end: "17:00",
      break: "01:00",
      overtimeAfter: "09:00",
      status: "active",
    },
    {
      name: "Night Shift",
      start: "18:00",
      end: "02:00",
      break: "00:30",
      overtimeAfter: "08:00",
      status: "active",
    },
  ]);

  return (
    <div className="admin-shifts-container">

      {/* ================= HEADER ================= */}
      <div className="admin-shifts-header">
        <h1>Shift Rules & Working Hours</h1>
        <p>Manage employee shifts, working hours, overtime rules and scheduling</p>
      </div>

      {/* ================= ACTION BAR ================= */}
      <div className="shift-action-bar">
        <button className="btn-primary">
          <Plus size={18} /> Create New Shift
        </button>
      </div>

      {/* ================= SHIFT CARDS ================= */}
      <div className="shift-grid">
        {shifts.map((shift, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="shift-card"
          >
            <div className="shift-card-header">
              <h3>{shift.name}</h3>
              <span className={`status-badge ${shift.status}`}>
                {shift.status}
              </span>
            </div>

            <div className="shift-info">
              <div>
                <Clock size={16} />
                <span>{shift.start} - {shift.end}</span>
              </div>

              <div>
                <Timer size={16} />
                <span>Break: {shift.break}</span>
              </div>

              <div>
                <CalendarDays size={16} />
                <span>OT After: {shift.overtimeAfter}</span>
              </div>
            </div>

            <div className="shift-actions">
              <button className="btn-secondary">
                <Settings size={16} /> Edit
              </button>
              <button className="btn-danger">
                Disable
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ================= WEEKLY RULES ================= */}
      <div className="weekly-rules">
        <h2>Weekly Working Rules</h2>

        <div className="week-grid">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
            <div key={day} className="day-card">
              <h4>{day}</h4>
              <p>Assigned Shift: Morning</p>
              <button className="btn-secondary-small">Change</button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= OVERTIME SETTINGS ================= */}
      <div className="overtime-section">
        <h2>Overtime & Compliance Rules</h2>

        <div className="overtime-grid">
          <div className="rule-item">
            <label>Maximum Weekly Hours</label>
            <input type="number" defaultValue={48} />
          </div>

          <div className="rule-item">
            <label>Overtime Rate (%)</label>
            <input type="number" defaultValue={150} />
          </div>

          <div className="rule-item">
            <label>Late Arrival Grace (Minutes)</label>
            <input type="number" defaultValue={15} />
          </div>
        </div>

        <button className="btn-primary save-btn">
          Save Rules
        </button>
      </div>

    </div>
  );
}