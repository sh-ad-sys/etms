"use client";

import {
  LayoutDashboard,
  
  ClipboardList,
  Users,
  BarChart3,
  FileCheck,
  MessageSquare,
  BellRing,
  ShieldCheck,
  Clock,
  QrCode,
  History,
  Laptop,
  Calendar,
  Server,
  
} from "lucide-react";
import Link from "next/link";
import "@/styles/supervisor-dashboard.css";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <LayoutDashboard size={24} />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users, configure systems, monitor security, and oversee integrations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Active Users" value="120" />
        <StatCard icon={ShieldCheck} title="Pending Permissions" value="8" />
        <StatCard icon={Server} title="Servers Online" value="4" />
        <StatCard icon={BellRing} title="Security Alerts" value="3" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          <Section title="User & Role Management">
            <Action icon={Users} label="Manage Users" href="/dashboard/admin/users" />
            <Action icon={ShieldCheck} label="Roles & Permissions" href="/dashboard/admin/roles" />
            <Action icon={Clock} label="Lock/Suspend Accounts" href="/dashboard/admin/account-status" />
          </Section>

          <Section title="System Configuration">
            <Action icon={Calendar} label="Shift Rules & Hours" href="/dashboard/admin/shifts" />
            <Action icon={QrCode} label="QR & GPS Settings" href="/dashboard/admin/qr-gps" />
            <Action icon={Laptop} label="Device Restrictions" href="/dashboard/admin/devices" />
          </Section>

          <Section title="Security & Audit">
            <Action icon={History} label="Login Activity" href="/dashboard/admin/login-activity" />
            <Action icon={Server} label="Device & IP Tracking" href="/dashboard/admin/device-tracking" />
            <Action icon={BellRing} label="Failed Login Alerts" href="/dashboard/admin/alerts" />
            <Action icon={ClipboardList} label="Audit Logs" href="/dashboard/admin/audit-logs" />
          </Section>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          <Section title="System Health">
            <Action icon={Server} label="Server Status" href="/dashboard/admin/server-status" />
            <Action icon={BarChart3} label="Database Health" href="/dashboard/admin/db-health" />
            <Action icon={FileCheck} label="Backup & Restore" href="/dashboard/admin/backups" />
          </Section>

          <Section title="Integrations">
            <Action icon={Users} label="Biometric Systems" href="/dashboard/admin/biometric" />
            <Action icon={FileCheck} label="Payroll Systems" href="/dashboard/admin/payroll" />
            <Action icon={MessageSquare} label="Email & SMS Gateways" href="/dashboard/admin/communication" />
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: string | number }) {
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-section-title mb-3">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Action({ icon: Icon, label, href }: { icon: any; label: string; href: string }) {
  return (
    <Link href={href} className="dashboard-action flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
