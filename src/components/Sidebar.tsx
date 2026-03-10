"use client";

import Link from "next/link";
import { useState } from "react";
import { sidebarMenus } from "@/config/sidebarMenus";
import { ChevronDown, ChevronRight } from "lucide-react";

/* ===================================================
   AUTO ROLE TYPE (BEST PRACTICE)
   This automatically matches sidebarMenus roles
=================================================== */
type Role = keyof typeof sidebarMenus;

type SidebarProps = {
  role: Role;
  collapsed: boolean;
};

export default function Sidebar({ role, collapsed }: SidebarProps) {
  const menuSections = sidebarMenus[role];

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] =
    useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <nav className="sidebar-nav">
        {menuSections.map((section) => (
          <div
            key={section.title || section.items[0].label}
            className="sidebar-section"
          >
            {/* Section title */}
            {!collapsed && section.title && (
              <button
                className="sidebar-section-title flex items-center justify-between w-full px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => toggleSection(section.title)}
              >
                <span>{section.title}</span>

                {expandedSections[section.title] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}

            {/* Section items */}
            <div
              className={`sidebar-section-items pl-4 mt-1 overflow-hidden transition-all duration-300 ${
                section.title
                  ? expandedSections[section.title]
                    ? "max-h-96"
                    : "max-h-0"
                  : "max-h-96"
              }`}
            >
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="sidebar-link flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
