"use client";

import "@/styles/shift-utilization.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Users,
  Clock,
  TrendingUp,
  Factory,
  Download,
} from "lucide-react";

/* ===========================
   MOCK SHIFT UTILIZATION DATA
=========================== */

const shiftEfficiency = [
  { shift: "Morning", utilization: 92 },
  { shift: "Afternoon", utilization: 87 },
  { shift: "Night", utilization: 78 },
];

const departmentShift = [
  { name: "Production", value: 45 },
  { name: "Warehouse", value: 25 },
  { name: "Quality", value: 18 },
  { name: "Admin", value: 12 },
];

const COLORS = ["#d71920", "#0f2e63", "#f59e0b", "#22c55e"];

export default function ShiftUtilizationPage() {
  return (
    <div className="shift-page">

      {/* HEADER */}
      <div className="shift-header">
        <div>
          <h1>
            <Factory size={24} />
            Shift Utilization Analytics
          </h1>
          <p>Royal Mabati Workforce Productivity Monitoring</p>
        </div>

        <button className="export-btn">
          <Download size={16}/>
          Export Report
        </button>
      </div>

      {/* KPI GRID */}
      <div className="shift-kpi-grid">

        <div className="shift-kpi-card success">
          <Users/>
          <div>
            <h3>89%</h3>
            <p>Overall Shift Utilization</p>
          </div>
          <TrendingUp className="kpi-icon"/>
        </div>

        <div className="shift-kpi-card warning">
          <Clock/>
          <div>
            <h3>7%</h3>
            <p>Idle Workforce Time</p>
          </div>
        </div>

        <div className="shift-kpi-card primary">
          <Users/>
          <div>
            <h3>3</h3>
            <p>Active Shifts Today</p>
          </div>
        </div>

      </div>

      {/* MAIN CHARTS */}
      <div className="shift-grid">

        {/* SHIFT UTILIZATION TREND */}
        <div className="chart-card">
          <h2>Shift Efficiency Performance</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shiftEfficiency}>
              <XAxis dataKey="shift"/>
              <YAxis/>
              <Tooltip/>

              <Bar
                dataKey="utilization"
                radius={[6,6,0,0]}
                fill="#0f2e63"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DEPARTMENT SHIFT DISTRIBUTION */}
        <div className="chart-card">
          <h2>Department Workforce Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentShift}
                dataKey="value"
                innerRadius={55}
                outerRadius={100}
              >
                {departmentShift.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}