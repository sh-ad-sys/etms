"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Clock,
  DollarSign,
  ShieldCheck,
  BarChart3,
  FileCheck,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "@/styles/supervisor-dashboard.css";

/* ================= EXECUTIVE DATA (MOCK) ================= */

const monthlyTrend = [
  { month: "Jan", attendance: 91, productivity: 88 },
  { month: "Feb", attendance: 89, productivity: 86 },
  { month: "Mar", attendance: 92, productivity: 90 },
  { month: "Apr", attendance: 94, productivity: 93 },
];

const overtimeCost = [
  { dept: "IT", cost: 4200 },
  { dept: "Logistics", cost: 6800 },
  { dept: "Finance", cost: 2100 },
  { dept: "HR", cost: 1300 },
];

const complianceRisk = [
  { name: "Compliant", value: 72 },
  { name: "At Risk", value: 18 },
  { name: "Critical", value: 10 },
];

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

/* ================= PAGE ================= */

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <LayoutDashboard size={24} />
          Executive Manager Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Strategic workforce intelligence, financial impact analysis, and compliance oversight.
        </p>
      </div>

      {/* ================= EXECUTIVE KPIs ================= */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Total Workforce" value="156" />
        <StatCard icon={Clock} title="Total Overtime Hours" value="124h" />
        <StatCard icon={DollarSign} title="Overtime Cost (Monthly)" value="$14,400" />
        <StatCard icon={ShieldCheck} title="Overall Compliance Score" value="92%" />
      </div>

      {/* ================= EXECUTIVE INSIGHTS ================= */}
      <div className="dashboard-card executive-insight">
        <h2 className="dashboard-section-title flex items-center gap-2">
          <TrendingUp size={18} />
          Executive Insights
        </h2>

        <ul className="space-y-2 text-sm">
          <li>
            <TrendingUp size={14} /> Attendance improved by <strong>+3%</strong> this quarter.
          </li>
          <li>
            <TrendingDown size={14} /> Logistics department accounts for <strong>47%</strong> of overtime costs.
          </li>
          <li>
            <AlertTriangle size={14} /> 10% of staff are flagged under <strong>critical compliance risk</strong>.
          </li>
        </ul>
      </div>

      {/* ================= ANALYTICS GRID ================= */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Attendance vs Productivity */}
        <div className="dashboard-card lg:col-span-2">
          <h2 className="dashboard-section-title">
            Productivity vs Attendance Trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="attendance" strokeWidth={3} />
              <Line dataKey="productivity" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Risk */}
        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Compliance Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={complianceRisk} dataKey="value" innerRadius={55} outerRadius={90}>
                {complianceRisk.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= COST ANALYSIS ================= */}
      <div className="dashboard-card">
        <h2 className="dashboard-section-title flex items-center gap-2">
          <DollarSign size={18} />
          Overtime Cost by Department
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={overtimeCost}>
            <XAxis dataKey="dept" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cost" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="grid gap-6 lg:grid-cols-2">

        <Section title="Executive Actions">
          <Action icon={FileCheck} label="Final Leave Approvals" href="/dashboard/manager/leave-approvals" />
          <Action icon={ClipboardList} label="Disciplinary Confirmations" href="/dashboard/manager/disciplinary" />
          <Action icon={ShieldCheck} label="Attendance Exemptions" href="/dashboard/manager/exemptions" />
        </Section>

        <Section title="Reports & Export">
          <Action icon={BarChart3} label="Monthly Performance Reports" href="/dashboard/manager/monthly-report" />
          <Action icon={BarChart3} label="Department Comparison Reports" href="/dashboard/manager/department-report" />
          <Action icon={FileCheck} label="Export PDF / Excel Summaries" href="/dashboard/manager/export" />
        </Section>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="dashboard-card flex items-center gap-4">
      <Icon size={20} />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="text-xl font-semibold">{value}</h3>
      </div>
    </div>
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
      <div className="grid gap-3">{children}</div>
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
