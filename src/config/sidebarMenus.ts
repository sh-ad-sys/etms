import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
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
  IdCard,
  Laptop,
  ShieldAlert,
  CheckSquare,
  Calendar,
  Bell,
  Settings,
  Server,
  HomeIcon,
  ClipboardPen,
} from "lucide-react";
import "@/styles/sidebar.css";
import { TaskListCard } from "@/app/dashboard/components/staff/TaskListCard";
/* ====================== TYPES ====================== */

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

/* ====================== SIDEBAR MENUS ====================== */

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
      title: "Dashboard Overview",
      items: [
        { label: "Supervisor Dashboard", href: "/dashboard/supervisor", icon: LayoutDashboard },
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
        { label: "Live Check-In Map", href: "/dashboard/supervisor/attendance-map", icon: MapPin },
        { label: "Late & Early Logs", href: "/dashboard/supervisor/late-logs", icon: Clock },
        { label: "Missing Check-Ins", href: "/dashboard/supervisor/missing-checkins", icon: ShieldAlert },
        
      ],
    },
     {
      title: "Request Management",
      items: [
        { label: "Leave Requests", href: "/dashboard/supervisor/leave-requests", icon: Calendar },
      ],
    },
  ],

  manager: [
    {
      title: "Dashboard Overview",
      items: [
        { label: "Manager Dashboard", href: "/dashboard/manager", icon: LayoutDashboard },
      ],
    },
    {
      title: "Attendance Analytics",
      items: [
        { label: "Department Attendance", href: "/dashboard/manager/attendance-overview", icon: Users },
        { label: "Attendance Trends", href: "/dashboard/manager/attendance-trends", icon: BarChart3 },
        { label: "Shift Utilization", href: "/dashboard/manager/shift-utilization", icon: Clock },
      ],
    },
  ],

  hr: [
    {
      title: "HR Dashboard",
      items: [
        { label: "HR Dashboard", href: "/dashboard/hr", icon: LayoutDashboard },
        { label: "Employee Profiles", href: "/dashboard/hr/profiles", icon: Users },
        { label: "Attendance Records", href: "/dashboard/hr/attendance", icon: Clock },
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
      title: "System Administration",
      items: [
        { label: "User Management", href: "/dashboard/admin/users", icon: Users },
        { label: "System Settings", href: "/dashboard/admin/settings", icon: Settings },
        { label: "System Health", href: "/dashboard/admin/health", icon: Server },
      ],
    },
  ],
};