"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import "@/styles/dashboard-layout.css";

interface DashboardLayoutProps {
  children: ReactNode;
}

type Role = "staff" | "supervisor" | "manager" | "hr" | "admin";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const getRoleFromPath = (): Role => {
    if (pathname.startsWith("/dashboard/supervisor")) return "supervisor";
    if (pathname.startsWith("/dashboard/manager")) return "manager";
    if (pathname.startsWith("/dashboard/hr")) return "hr";
    if (pathname.startsWith("/dashboard/admin")) return "admin";
    return "staff";
  };

  const role = getRoleFromPath();

  return (
    <div className={`dashboard-root ${collapsed ? "sidebar-is-collapsed" : "sidebar-is-expanded"}`}>
      <div className={`dashboard-sidebar ${collapsed ? "collapsed" : "expanded"}`}>
        <Sidebar role={role} collapsed={collapsed} />
      </div>

      <div className="dashboard-main-wrapper">
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <main className="dashboard-content">
          <div className="dashboard-container">{children}</div>
          <Footer collapsed={collapsed} />
        </main>
      </div>
    </div>
  );
}
