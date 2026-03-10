"use client";

import { useEffect, useState } from "react";
import "@/styles/manager-attendance-trends.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { io } from "socket.io-client";

import {
  Brain,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  Download,
} from "lucide-react";

/* ===============================
   AI FORECAST SIMULATION DATA
=============================== */

const forecastData = [
  { day: "Mon", risk: 12 },
  { day: "Tue", risk: 18 },
  { day: "Wed", risk: 8 },
  { day: "Thu", risk: 20 },
  { day: "Fri", risk: 14 },
];

const attendanceStream = [
  { time: "08:00", workers: 120 },
  { time: "09:00", workers: 135 },
  { time: "10:00", workers: 140 },
  { time: "11:00", workers: 138 },
  { time: "12:00", workers: 142 },
];

export default function EliteAttendanceAnalytics() {
  const [liveWorkers, setLiveWorkers] = useState(0);
  const [riskLevel, setRiskLevel] = useState("Low");

  /* ===============================
     WEB SOCKET REAL TIME STREAM
  =============================== */

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("attendanceUpdate", (data) => {
      setLiveWorkers(data.count);

      if (data.count < 100) setRiskLevel("High");
      else if (data.count < 130) setRiskLevel("Medium");
      else setRiskLevel("Low");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="manager-trends-container">

      <div className="manager-trends-header">
        <div>
          <h1>Factory Workforce Intelligence</h1>
          <p>Royal Mabati AI Workforce Monitoring</p>
        </div>

        <button className="export-btn">
          <Download size={16} />
          Export Intelligence Report
        </button>
      </div>

      {/* LIVE KPI INTELLIGENCE */}
      <div className="kpi-grid">

        <div className="kpi-card ai">
          <Brain size={22} />
          <div>
            <h3>{riskLevel}</h3>
            <p>AI Risk Prediction</p>
          </div>
        </div>

        <div className="kpi-card success">
          <Users />
          <div>
            <h3>{liveWorkers}</h3>
            <p>Live Workforce Presence</p>
          </div>
        </div>

        <div className="kpi-card warning">
          <AlertTriangle />
          <div>
            <h3>Attendance Risk Monitor</h3>
            <p>Predictive HR Analytics</p>
          </div>
        </div>

      </div>

      {/* AI FORECAST CHART */}
      <div className="chart-card">
        <h2>
          <Activity size={18} /> Absenteeism Risk Forecast
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="#d71920"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LIVE WORKFORCE STREAM */}
      <div className="chart-card">
        <h2>
          <TrendingUp size={18} /> Live Workforce Flow
        </h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attendanceStream}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="workers" fill="#0f2e63" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}