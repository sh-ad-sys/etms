"use client";

import { useState } from "react";
import "@/styles/hr-profiles.css";

import {
  Search,
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
} from "lucide-react";

interface StaffProfile {
  id: string;
  name: string;
  employeeNo: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: "Active" | "Inactive";
}

export default function HRProfilesTablePage() {
  const [search, setSearch] = useState("");

  const staff: StaffProfile[] = [
    {
      id: "1",
      name: "John Mwangi",
      employeeNo: "RMF-0012",
      email: "john@royalmabati.co.ke",
      phone: "+254 712 000 111",
      department: "Production",
      role: "Machine Operator",
      status: "Active",
    },
    {
      id: "2",
      name: "Grace Achieng",
      employeeNo: "RMF-0013",
      email: "grace@royalmabati.co.ke",
      phone: "+254 712 222 333",
      department: "Human Resources",
      role: "HR Officer",
      status: "Active",
    },
    {
      id: "3",
      name: "Peter Otieno",
      employeeNo: "RMF-0020",
      email: "peter@royalmabati.co.ke",
      phone: "+254 700 444 555",
      department: "Warehouse",
      role: "Supervisor",
      status: "Inactive",
    },
  ];

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hr-table-container">

      {/* HEADER */}
      <div className="hr-table-header">
        <div>
          <h1>Staff Profiles</h1>
          <p>Royal Mabati ETMS Workforce Records</p>
        </div>

        <div className="hr-table-search">
          <Search size={16} />
          <input
            placeholder="Search by name or employee number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="hr-table">
          <thead>
            <tr>
              <th>Employee No</th>
              <th>Staff Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.employeeNo}</td>

                <td className="name-cell">
                  <User size={16} />
                  {staff.name}
                </td>

                <td>
                  <Mail size={14} />
                  {staff.email}
                </td>

                <td>
                  <Phone size={14} />
                  {staff.phone}
                </td>

                <td>
                  <Building size={14} />
                  {staff.department}
                </td>

                <td>
                  <Briefcase size={14} />
                  {staff.role}
                </td>

                <td>
                  <span className={`status ${staff.status.toLowerCase()}`}>
                    {staff.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">
            No staff profiles found
          </div>
        )}
      </div>
    </div>
  );
}