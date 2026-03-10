"use client";

import { motion } from "framer-motion";
import "@/styles/hr.css";
import {
  Users,
  FileText,
  ShieldCheck,
  Bell,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

type IconType = React.ComponentType<{ className?: string }>;

/* ================= MOCK TREND DATA ================= */

const attendanceTrend = [
  { month: "Jan", present: 210 },
  { month: "Feb", present: 225 },
  { month: "Mar", present: 240 },
  { month: "Apr", present: 230 },
  { month: "May", present: 248 },
];

const leaveTrend = [
  { month: "Jan", leave: 12 },
  { month: "Feb", leave: 18 },
  { month: "Mar", leave: 9 },
  { month: "Apr", leave: 14 },
  { month: "May", leave: 11 },
];

const complianceTrend = [
  { month: "Jan", score: 88 },
  { month: "Feb", score: 90 },
  { month: "Mar", score: 92 },
  { month: "Apr", score: 93 },
  { month: "May", score: 94 },
];

/* ================= COMPONENTS ================= */

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: IconType;
  title: string;
  value: string | number;
}) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} className="hr-stat-card">
      <Icon className="hr-stat-icon" />
      <h4>{title}</h4>
      <p>{value}</p>
    </motion.div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: IconType;
  title: string;
  desc: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="hr-card">
      <Icon className="hr-card-icon" />
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}

/* ================= MAIN PAGE ================= */

export default function HRDashboard() {
  return (
    <div className="hr-dashboard">
      {/* ================= HEADER ================= */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hr-title"
      >
        HR Command Center
      </motion.h1>

      {/* ================= KPI STATS ================= */}
      <div className="hr-stats-grid">
        <StatCard icon={Users} title="Total Employees" value="248" />
        <StatCard icon={ClipboardCheck} title="Active Cases" value="12" />
        <StatCard icon={AlertTriangle} title="Violations" value="6" />
        <StatCard icon={ShieldCheck} title="Compliance Score" value="94%" />
      </div>

      {/* ================= TREND GRAPHS ================= */}
      <section className="hr-section">
        <h2>HR Analytics Trends</h2>

        <div className="hr-graphs-grid">
          {/* Attendance Trend */}
          <div className="hr-chart-card">
            <h3>Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="present" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leave Trend */}
          <div className="hr-chart-card">
            <h3>Leave Usage</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={leaveTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leave" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Trend */}
          <div className="hr-chart-card">
            <h3>Compliance Score Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ================= EMPLOYEE MANAGEMENT ================= */}
      <section className="hr-section">
        <h2>Employee Management</h2>
        <div className="hr-grid">
          <SectionCard
            icon={Users}
            title="Employee Profiles"
            desc="Bio, roles, departments and full HR records"
          />
          <SectionCard
            icon={ShieldCheck}
            title="Employment Status"
            desc="Active, suspended and exited monitoring"
          />
          <SectionCard
            icon={FileText}
            title="ID Issuance Tracking"
            desc="Reissuance logs and employee badge records"
          />
        </div>
      </section>

      {/* ================= COMPLIANCE ================= */}
      <section className="hr-section">
        <h2>Attendance Compliance</h2>
        <div className="hr-grid">
          <SectionCard
            icon={ShieldCheck}
            title="Official Records"
            desc="Legal attendance history logs"
          />
          <SectionCard
            icon={FileText}
            title="Audit Logs"
            desc="Track edits, approvals and HR actions"
          />
          <SectionCard
            icon={ClipboardCheck}
            title="Legal Reports"
            desc="Generate compliance-ready reports"
          />
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="hr-section">
        <h2>Recent HR Activity</h2>

        <div className="hr-timeline">
          <motion.div whileHover={{ x: 6 }} className="hr-timeline-item">
            <Bell /> Policy update sent to staff
          </motion.div>

          <motion.div whileHover={{ x: 6 }} className="hr-timeline-item">
            <AlertTriangle /> Attendance warning issued
          </motion.div>

          <motion.div whileHover={{ x: 6 }} className="hr-timeline-item">
            <ClipboardCheck /> Leave approved by HR
          </motion.div>
        </div>
      </section>
    </div>
  );
}
