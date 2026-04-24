"use client";

import "@/styles/admin-shifts.css";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useCallback } from "react";

const API = "http://localhost/etms/controllers/admin";

export default function AdminShiftsPage() {
  const [loading, setLoading] = useState(false);
  const [graceValue, setGraceValue] = useState(15);
  const [maxHours, setMaxHours] = useState(48);
  const [overtimeRate, setOvertimeRate] = useState(150);

  const handleGraceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setGraceValue(value);
  };

  const handleMaxHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setMaxHours(value);
  };

  const handleOvertimeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setOvertimeRate(value);
  };

  const handleSaveRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/save-compliance-rules.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          maxWeeklyHours: maxHours,
          overtimeRate: overtimeRate,
          graceMinutes: graceValue
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const json = await res.json();
      if (json.success) {
        alert("Rules saved successfully!");
      } else {
        alert(json.error || "Failed to save rules");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error saving rules";
      console.error("Save error:", errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [maxHours, overtimeRate, graceValue]);

  return (
    <div className="admin-shifts-container">
      {/* HEADER */}
      <div className="admin-shifts-header">
        <div>
          <h1><Clock size={28} /> Overtime &amp; Compliance Rules</h1>
          <p>Configure system-wide overtime rules and compliance settings</p>
        </div>
        <button className="shift-refresh-btn" disabled={loading} title="Rules saved" style={{ opacity: 0.5 }}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* OVERTIME RULES */}
      <div className="overtime-card">
        <h2>Global Compliance Settings</h2>
        <div className="overtime-grid">
          <div className="rule-item">
            <label>Maximum Weekly Hours</label>
            <div className="input-group">
              <input 
                type="number" 
                min="0" 
                value={maxHours}
                onChange={handleMaxHoursChange}
              />
              <span className="unit">hrs</span>
            </div>
          </div>

          <div className="rule-item">
            <label>Overtime Rate</label>
            <div className="input-group">
              <input 
                type="number" 
                min="0" 
                value={overtimeRate}
                onChange={handleOvertimeRateChange}
              />
              <span className="unit">%</span>
            </div>
          </div>

          <div className="rule-item">
            <label>Late Arrival Grace</label>
            <div className="input-group">
              <input 
                type="number" 
                min="0" 
                value={graceValue}
                onChange={handleGraceChange}
              />
              <span className="unit">min</span>
            </div>
          </div>
        </div>
        <button 
          className="btn-primary save-btn" 
          type="button"
          onClick={handleSaveRules}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Rules"}
        </button>
      </div>
    </div>
  );
}

