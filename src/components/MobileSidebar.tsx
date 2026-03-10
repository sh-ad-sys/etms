"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LucideIcon,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ================= TYPES =================
type Role = "staff" | "supervisor" | "manager" | "hr" | "admin";

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MobileSidebarProps {
  role: Role;
  menu: MenuSection[];
}

// ================= COMPONENT =================
export default function MobileSidebar({ role, menu }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSection = (title: string) =>
    setOpenSection(openSection === title ? null : title);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-3 text-white bg-blue-900 rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <aside className="w-64 h-full bg-[#1E3A8A] text-white p-4 shadow-lg flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="mb-4 text-sm font-semibold self-end"
            >
              ✕ Close
            </button>

            {/* Menu Sections */}
            <nav className="flex-1 overflow-y-auto">
              {menu.map((section) => (
                <div key={section.title} className="mb-2">
                  {/* Section Title */}
                  <button
                    className="w-full flex justify-between items-center px-3 py-2 font-semibold rounded-lg hover:bg-white/10 transition"
                    onClick={() => toggleSection(section.title)}
                  >
                    <span>{section.title}</span>
                    {openSection === section.title ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Section Items */}
                  {openSection === section.title &&
                    section.items
                      .filter((item) => item.roles.includes(role))
                      .map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 ml-2 rounded-lg transition-colors ${
                              active
                                ? "bg-white text-blue-900 font-bold"
                                : "hover:bg-white/20"
                            }`}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="text-center text-sm opacity-75 mt-auto">
              © 2026 Royal Mabati Factory
              <br />
              ETMS v1.0
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
