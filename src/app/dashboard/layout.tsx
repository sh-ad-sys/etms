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

  /* ===================================================
     ROLE DETECTION BASED ON ROUTE
     (TEMP — Replace later with auth session)
  =================================================== */
  const getRoleFromPath = (): Role => {
    if (pathname.startsWith("/dashboard/supervisor")) return "supervisor";
    if (pathname.startsWith("/dashboard/manager")) return "manager";
    if (pathname.startsWith("/dashboard/hr")) return "hr";
    if (pathname.startsWith("/dashboard/admin")) return "admin";
    return "staff";
  };

  const role = getRoleFromPath();

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <Sidebar role={role} collapsed={collapsed} />
      </div>

      {/* Right Section */}
      <div className="dashboard-main-wrapper">
        {/* Topbar */}
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />

        {/* Content */}
        <main
          className={`dashboard-content ${
            collapsed ? "dashboard-collapsed" : "dashboard-expanded"
          }`}
        >
          <div className="dashboard-container">{children}</div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
