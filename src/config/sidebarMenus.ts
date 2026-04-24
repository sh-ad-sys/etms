import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Users,
  BarChart3,
  FileCheck,
  MessageSquare,
  ShieldCheck,
  Clock,
  QrCode,
  History,
  IdCard,
  Laptop,
  ShieldAlert,
  CheckSquare,
  Calendar,
  Bell,
  Settings,
  Server,
  ClipboardPen,
  FileWarning,
  CreditCard,
  Activity,
  Award,
} from "lucide-react";
import "@/styles/sidebar.css";

export type SidebarRole =
  | "staff"
  | "supervisor"
  | "manager"
  | "hr"
  | "admin";

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const sidebarMenus: Record<SidebarRole, SidebarSection[]> = {
  staff: [
    {
      title: "Home",
      items: [
        { label: "Staff Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
      ],
    },
    {
      title: "Attendance & Time",
      items: [
        { label: "QR Check-In", href: "/dashboard/attendance/qr", icon: QrCode },
        { label: "Arrival & Leave Time", href: "/dashboard/attendance/times", icon: Clock },
        { label: "Attendance History", href: "/dashboard/attendance/history", icon: History },
      ],
    },
    {
      title: "Identity & Security",
      items: [
        { label: "Report Lost ID", href: "/dashboard/id/report", icon: IdCard },
        { label: "ID Status", href: "/dashboard/id/id-status", icon: IdCard },
        { label: "Login Devices", href: "/dashboard/security/devices", icon: Laptop },
        { label: "Security Alerts", href: "/dashboard/security/alerts", icon: ShieldAlert },
      ],
    },
    {
      title: "Work & Productivity",
      items: [
        { label: "Daily Tasks", href: "/dashboard/tasks", icon: ClipboardList },
        { label: "Task Checklist", href: "/dashboard/tasks/checklist", icon: CheckSquare },
        { label: "Supervisor Feedback", href: "/dashboard/tasks/feedback", icon: MessageSquare },
      ],
    },
    {
      title: "Leave Management",
      items: [
        { label: "Apply for Leave", href: "/dashboard/leave/apply", icon: Calendar },
        { label: "Leave Status", href: "/dashboard/leave/status", icon: Calendar },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
        { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
      ],
    },
  ],

  supervisor: [
    {
      title: "Home",
      items: [
        { label: "Supervisor Dashboard", href: "/dashboard/supervisor", icon: LayoutDashboard },
        { label: "QR Check-In", href: "/dashboard/supervisor/qr", icon: QrCode },
      ],
    },
    {
      title: "Performance and Tasks",
      items: [
        { label: "Task assignment", href: "/dashboard/supervisor/task-assignment", icon: ClipboardPen },
      ],
    },
    {
      title: "Attendance Oversight",
      items: [
        { label: "Staff Attendance", href: "/dashboard/supervisor/staff-attendance", icon: Users },
        { label: "Live Check-In Map", href: "/dashboard/supervisor/attendance-map", icon: MapPin },
        { label: "Late & Early Logs", href: "/dashboard/supervisor/late-logs", icon: Clock },
        { label: "Missing Check-Ins", href: "/dashboard/supervisor/missing-checkins", icon: ShieldAlert },
        { label: "Shift Rules & Hours", href: "/dashboard/supervisor/shifts", icon: Calendar },
      ],
    },
    {
      title: "Request Management",
      items: [
        { label: "Leave Requests", href: "/dashboard/supervisor/leave-requests", icon: Calendar },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Notifications", href: "/dashboard/supervisor/notifications", icon: Bell },
        { label: "Messages", href: "/dashboard/supervisor/messages", icon: MessageSquare },
      ],
    },
  ],

  manager: [
    {
      title: "Home",
      items: [
        { label: "Manager Dashboard", href: "/dashboard/manager", icon: LayoutDashboard },
        { label: "QR Check-In", href: "/dashboard/manager/qr", icon: QrCode },
      ],
    },
    {
      title: "Organization Management",
      items: [
        { label: "Assign Supervisors", href: "/dashboard/manager/supervisor-assignments", icon: Users },
      ],
    },
    {
      title: "Attendance Analytics",
      items: [
        { label: "Supervisor Attendance", href: "/dashboard/manager/supervisor-attendance", icon: Users },
        { label: "Department Attendance", href: "/dashboard/manager/attendance-overview", icon: Users },
        { label: "Attendance Trends", href: "/dashboard/manager/attendance-trends", icon: BarChart3 },
        { label: "Shift Utilization", href: "/dashboard/manager/shift-utilization", icon: Clock },
        { label: "Leave Approvals", href: "/dashboard/manager/leave-approvals", icon: FileCheck },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Notifications", href: "/dashboard/manager/notifications", icon: Bell },
        { label: "Messages", href: "/dashboard/manager/messages", icon: MessageSquare },
      ],
    },
  ],

  hr: [
    {
      title: "HR Dashboard",
      items: [
        { label: "HR Dashboard", href: "/dashboard/hr", icon: LayoutDashboard },
      ],
    },
    {
      title: "Employee Management",
      items: [
        { label: "Employee Profiles", href: "/dashboard/hr/profiles", icon: Users },
        { label: "Attendance Records", href: "/dashboard/hr/attendance", icon: Clock },
        { label: "Leave Approvals", href: "/dashboard/hr/leave-approvals", icon: FileCheck },
        { label: "Employment Status", href: "/dashboard/hr/employment-status", icon: ShieldCheck },
      ],
    },
    {
      title: "ID Card Management",
      items: [
        { label: "Lost ID Reports", href: "/dashboard/hr/lost-id-reports", icon: FileWarning },
        { label: "Replacement Requests", href: "/dashboard/hr/replacement-requests", icon: CreditCard },
        { label: "ID Issuance Tracking", href: "/dashboard/hr/id-issuance-tracking", icon: IdCard },
      ],
    },
    {
      title: "Compliance",
      items: [
        { label: "Official Records", href: "/dashboard/hr/official-records", icon: ShieldCheck },
        { label: "Audit Logs", href: "/dashboard/hr/audit-logs", icon: ClipboardList },
        { label: "Legal Reports", href: "/dashboard/hr/legal-reports", icon: FileCheck },
      ],
    },
    {
      title: "Analytics & Reports",
      items: [
        { label: "Attendance Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Notifications", href: "/dashboard/hr/notifications", icon: Bell },
        { label: "Messages", href: "/dashboard/hr/messages", icon: MessageSquare },
      ],
    },
  ],

  admin: [
    {
      title: "Home",
      items: [
        { label: "Admin Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Organization Management",
      items: [
        { label: "Departments", href: "/dashboard/admin/departments", icon: MapPin },
        { label: "Organizational Chart", href: "/dashboard/admin/org-chart", icon: Users },
        { label: "Manager Roles", href: "/dashboard/admin/manager-roles", icon: Award },
      ],
    },
    {
      title: "User & Role Management",
      items: [
        { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
        { label: "Roles & Permissions", href: "/dashboard/admin/roles", icon: ShieldCheck },
        { label: "Lock/Suspend Accounts", href: "/dashboard/admin/account-status", icon: Clock },
      ],
    },
    {
      title: "System Health",
      items: [
        { label: "System Health", href: "/dashboard/admin/health", icon: Activity },
        { label: "Backup & Restore", href: "/dashboard/admin/backup-restore", icon: FileCheck },
      ],
    },
    {
      title: "System Configuration",
      items: [
        { label: "QR & GPS Settings", href: "/dashboard/admin/qr-gps", icon: QrCode },
        { label: "Device Restrictions", href: "/dashboard/admin/devices", icon: Laptop },
      ],
    },
    {
      title: "Analytics & Reports",
      items: [
        { label: "Attendance Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Security & Audit",
      items: [
        { label: "Login Activity", href: "/dashboard/admin/login-activity", icon: History },
        { label: "Device & IP Tracking", href: "/dashboard/admin/device-tracking", icon: Server },
        { label: "Failed Login Alerts", href: "/dashboard/admin/alerts", icon: ShieldAlert },
        { label: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: ClipboardList },
      ],
    },
    {
      title: "Communication",
      items: [
        { label: "Notifications", href: "/dashboard/admin/notifications", icon: Bell },
        { label: "Messages", href: "/dashboard/admin/messages", icon: MessageSquare },
      ],
    },
  ],
};

