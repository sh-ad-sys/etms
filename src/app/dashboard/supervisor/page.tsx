"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  ClipboardCheck,
  Users,
  Clock, // ✅ added
  FileCheck,
  MessageSquare,
  BellRing,
  ShieldCheck,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

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
  LineChart,
  Line,
} from "recharts";

import "@/styles/supervisor-dashboard.css";

/* ================= MOCK DATA ================= */

const attendanceData = [
  { day: "Mon", present: 45 },
  { day: "Tue", present: 48 },
  { day: "Wed", present: 46 },
  { day: "Thu", present: 50 },
  { day: "Fri", present: 44 },
];

const punctualityData = [
  { name: "On Time", value: 78 },
  { name: "Late", value: 15 },
  { name: "Absent", value: 7 },
];

const weeklyLateTrend = [
  { week: "W1", late: 12 },
  { week: "W2", late: 9 },
  { week: "W3", late: 6 },
  { week: "W4", late: 4 },
];

const COLORS = ["#4f46e5", "#f59e0b", "#ef4444"];

/* ================= PAGE ================= */

export default function SupervisorDashboardPage() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <LayoutDashboard size={24} />
          Supervisor Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time oversight of attendance, approvals, and workforce performance.
        </p>
      </div>

      {/* KPI OVERVIEW (NOW CLICKABLE) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Staff Present" value="48" href="/dashboard/supervisor/staff" />
        <StatCard icon={Clock} title="Late Today" value="6" href="/dashboard/supervisor/late-report" />
        <StatCard icon={ShieldAlert} title="Missing Check-ins" value="2" href="/dashboard/supervisor/missing-checkins" />
        <StatCard icon={FileCheck} title="Pending Approvals" value="9" href="/dashboard/supervisor/approvals" />
      </div>

      {/* ANALYTICS */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="dashboard-card lg:col-span-2">
          <h2 className="dashboard-section-title">Weekly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Punctuality Breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={punctualityData} dataKey="value" innerRadius={50} outerRadius={90}>
                {punctualityData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2 space-y-6">

          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Late Arrival Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyLateTrend}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="late" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Section title="Supervisor Actions">
            <Action icon={MapPin} label="Live Check-In Map" href="/dashboard/supervisor/attendance-map" />
            <Action icon={ClipboardCheck} label="Correction Requests" href="/dashboard/supervisor/corrections" />
            <Action icon={Users} label="Staff Tasks" href="/dashboard/supervisor/staff-tasks" />
            <Action icon={ClipboardList} label="Compliance Scores" href="/dashboard/supervisor/compliance" />
          </Section>
        </div>

        <div className="space-y-6">

          {/* Approval Queue (Now Clickable Alerts) */}
          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Approval Queue</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/supervisor/leave-approvals" className="dashboard-alert clickable">
                  4 Leave requests pending
                </Link>
              </li>
              <li>
                <Link href="/dashboard/supervisor/shift-approvals" className="dashboard-alert clickable">
                  3 Shift approvals required
                </Link>
              </li>
              <li>
                <Link href="/dashboard/supervisor/id-verification" className="dashboard-alert clickable">
                  2 ID verifications pending
                </Link>
              </li>
            </ul>

            <div className="mt-4 space-y-2">
              <Mini icon={FileCheck} label="Leave Approvals" href="/dashboard/supervisor/leave-approvals" />
              <Mini icon={Clock} label="Shift Approvals" href="/dashboard/supervisor/shift-approvals" />
              <Mini icon={ShieldCheck} label="ID Verification" href="/dashboard/supervisor/id-verification" />
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="dashboard-section-title">Communication</h2>
            <Mini icon={MessageSquare} label="Announcements" href="/dashboard/supervisor/announcements" />
            <Mini icon={BellRing} label="Emergency Alerts" href="/dashboard/supervisor/emergency" />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="dashboard-card flex items-center gap-4 hover-card">
      <Icon size={20} />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="text-xl font-semibold">{value}</h3>
      </div>
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-section-title mb-3">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Action({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="dashboard-action">
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function Mini({
  icon: Icon,
  label,
  href,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="dashboard-mini-action">
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}