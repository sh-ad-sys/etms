"use client";

import "@/styles/admin-shifts.css";
import { Clock, CalendarDays, Plus, Settings, Timer, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ShiftItem {
  id: number;
  name: string;
  startLabel: string;
  endLabel: string;
  break: string;
  overtimeAfterLabel: string;
  status: string;
}

const API = "http://localhost/etms/controllers/admin";

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/get-shifts.php`, { credentials: "include" });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to load shifts.");
          return;
        }
        setShifts(json.shifts || []);
      } catch {
        setError("Unable to load shifts.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="admin-shifts-container">
      <div className="admin-shifts-header">
        <h1>Shift Rules &amp; Working Hours</h1>
        <p>Manage employee shifts, working hours, overtime rules and scheduling</p>
      </div>

      <div className="shift-action-bar">
        <button className="btn-primary" type="button" disabled>
          <Plus size={18} /> Create New Shift
        </button>
      </div>

      {loading ? (
        <div className="admin-shifts-empty"><Loader2 size={18} className="spin" /> Loading shifts...</div>
      ) : error ? (
        <div className="admin-shifts-empty">{error}</div>
      ) : (
        <div className="shift-grid">
          {shifts.map((shift) => (
            <motion.a
              key={shift.id}
              href={`#shift-${shift.id}`}
              whileHover={{ scale: 1.02 }}
              className="shift-card shift-card-link"
            >
              <div className="shift-card-header">
                <h3>{shift.name}</h3>
                <span className={`status-badge ${shift.status}`}>{shift.status}</span>
              </div>

              <div className="shift-info">
                <div>
                  <Clock size={16} />
                  <span>{shift.startLabel} - {shift.endLabel}</span>
                </div>

                <div>
                  <Timer size={16} />
                  <span>Break: {shift.break}</span>
                </div>

                <div>
                  <CalendarDays size={16} />
                  <span>OT After: {shift.overtimeAfterLabel}</span>
                </div>
              </div>

              <div className="shift-actions">
                <button className="btn-secondary" type="button">
                  <Settings size={16} /> Edit
                </button>
                <button className="btn-danger" type="button">Disable</button>
              </div>
            </motion.a>
          ))}
        </div>
      )}

      <div className="weekly-rules">
        <h2>Weekly Working Rules</h2>

        <div className="week-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={day} className="day-card" id={shifts[index]?.id ? `shift-${shifts[index].id}` : undefined}>
              <h4>{day}</h4>
              <p>Assigned Shift: {shifts[index % Math.max(shifts.length, 1)]?.name || "Unassigned"}</p>
              <button className="btn-secondary-small" type="button">Change</button>
            </div>
          ))}
        </div>
      </div>

      <div className="overtime-section">
        <h2>Overtime &amp; Compliance Rules</h2>

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

        <button className="btn-primary save-btn" type="button">Save Rules</button>
      </div>
    </div>
  );
}

