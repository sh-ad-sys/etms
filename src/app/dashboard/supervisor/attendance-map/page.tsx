"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import "@/styles/attendance-map.css";

type StaffLocation = {
  id: string;
  name: string;
  department: string;
  location: string;
  status: "On Site" | "Late" | "Absent";
  lastCheckIn: string;
};

export default function AttendanceMapPage() {
  const [search, setSearch] = useState("");

  const staff: StaffLocation[] = [
    {
      id: "1",
      name: "John Mwangi",
      department: "Production",
      location: "Sheet Rolling Section",
      status: "On Site",
      lastCheckIn: "08:01 AM",
    },
    {
      id: "2",
      name: "Grace Wanjiru",
      department: "Packaging",
      location: "Warehouse A",
      status: "Late",
      lastCheckIn: "08:35 AM",
    },
    {
      id: "3",
      name: "Peter Otieno",
      department: "Maintenance",
      location: "Roofing Line 2",
      status: "Absent",
      lastCheckIn: "-",
    },
  ];

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const onSite = staff.filter((s) => s.status === "On Site").length;
  const late = staff.filter((s) => s.status === "Late").length;
  const absent = staff.filter((s) => s.status === "Absent").length;

  return (
    <div className="attendance-map-page">

      {/* HEADER */}
      <div className="map-header">
        <h1>
          <MapPin size={24} />
          Live Attendance Map
        </h1>
        <p>Real-time workforce monitoring across Royal Mabati Factory</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="map-summary">
        <div className="summary-card onsite">
          <CheckCircle />
          <div>
            <h3>{onSite}</h3>
            <p>On Site</p>
          </div>
        </div>

        <div className="summary-card late">
          <Clock />
          <div>
            <h3>{late}</h3>
            <p>Late</p>
          </div>
        </div>

        <div className="summary-card absent">
          <AlertTriangle />
          <div>
            <h3>{absent}</h3>
            <p>Absent</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="map-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search staff or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MAIN GRID */}
      <div className="map-grid">

        {/* LEFT PANEL (Mock Map) */}
        <div className="map-container">
          <div className="mock-map">
            <Users size={40} />
            <p>Interactive Factory Location Map</p>
            <span>(Integrate Google Maps or Leaflet API here)</span>
          </div>
        </div>

        {/* RIGHT PANEL (STAFF LIST) */}
        <div className="map-staff-list">
          {filteredStaff.map((member) => (
            <div key={member.id} className="staff-card">
              <div className="staff-info">
                <h4>{member.name}</h4>
                <p>{member.department}</p>
                <span className="location">
                  <MapPin size={14} /> {member.location}
                </span>
              </div>

              <div className={`status-badge ${member.status.toLowerCase().replace(" ", "-")}`}>
                {member.status}
              </div>
            </div>
          ))}

          {filteredStaff.length === 0 && (
            <div className="empty-state">
              No staff found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}