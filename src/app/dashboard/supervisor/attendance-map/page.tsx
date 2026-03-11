"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapPin, Search, Users, Clock,
  CheckCircle, AlertTriangle, Loader2,
  RefreshCw, Wifi, WifiOff, Navigation,
} from "lucide-react";
import "@/styles/attendance-map.css";

/* ─── Types ─────────────────────────────────────────────── */

type StaffStatus = "On Site" | "Late" | "Absent" | "Outside";
type FilterStatus = "All" | StaffStatus;

type StaffMember = {
  id:           string;
  name:         string;
  employeeCode: string;
  department:   string;
  location:     string;
  shift:        string;
  status:       StaffStatus;
  lastCheckIn:  string;
  checkOut:     string | null;
  latitude:     number | null;
  longitude:    number | null;
  distance:     number | null;
};

type Summary = {
  total: number; onSite: number; late: number; absent: number; outside: number;
};

const API = "http://localhost/etms/controllers/supervisor";

const STATUS_CONFIG: Record<StaffStatus, { color: string; icon: React.ReactNode }> = {
  "On Site": { color: "on-site", icon: <CheckCircle  size={13} /> },
  "Late":    { color: "late",    icon: <Clock        size={13} /> },
  "Absent":  { color: "absent",  icon: <AlertTriangle size={13} /> },
  "Outside": { color: "outside", icon: <Navigation   size={13} /> },
};

/* ─── Component ─────────────────────────────────────────── */

export default function AttendanceMapPage() {

  const [staff,    setStaff]    = useState<StaffMember[]>([]);
  const [summary,  setSummary]  = useState<Summary>({ total:0, onSite:0, late:0, absent:0, outside:0 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterStatus>("All");
  const [asOf,     setAsOf]     = useState("");
  const [date,     setDate]     = useState("");

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/get-attendance-map.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff);
        setSummary(data.summary);
        setAsOf(data.asOf);
        setDate(data.date);
      } else {
        setError(data.error || "Failed to load attendance data.");
      }
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Auto-refresh every 60 seconds */
  useEffect(() => {
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* ── Filtered list ── */
  const filtered = useMemo(() =>
    staff
      .filter(s => filter === "All" || s.status === filter)
      .filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase()) ||
        s.employeeCode.toLowerCase().includes(search.toLowerCase())
      ),
    [staff, filter, search]
  );

  /* ── Render ── */
  return (
    <div className="attendance-map-page">

      {/* HEADER */}
      <div className="map-header">
        <div>
          <h1><MapPin size={22} /> Live Attendance Map</h1>
          <p>Real-time workforce monitoring · Royal Mabati Factory</p>
        </div>
        <div className="map-header-right">
          {date && <span className="map-date">{date}</span>}
          {asOf && (
            <span className="map-asof">
              <Wifi size={12} /> Updated {asOf}
            </span>
          )}
          <button className="map-refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="map-summary">
        <div className="summary-card total" onClick={() => setFilter("All")}>
          <Users size={20} />
          <div><h3>{summary.total}</h3><p>Total Staff</p></div>
        </div>
        <div className="summary-card onsite" onClick={() => setFilter("On Site")}>
          <CheckCircle size={20} />
          <div><h3>{summary.onSite}</h3><p>On Site</p></div>
        </div>
        <div className="summary-card late" onClick={() => setFilter("Late")}>
          <Clock size={20} />
          <div><h3>{summary.late}</h3><p>Late</p></div>
        </div>
        <div className="summary-card absent" onClick={() => setFilter("Absent")}>
          <AlertTriangle size={20} />
          <div><h3>{summary.absent}</h3><p>Absent</p></div>
        </div>
        {summary.outside > 0 && (
          <div className="summary-card outside" onClick={() => setFilter("Outside")}>
            <WifiOff size={20} />
            <div><h3>{summary.outside}</h3><p>Outside</p></div>
          </div>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <div className="map-controls">
        <div className="map-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search by name, department or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="map-filter-tabs">
          {(["All", "On Site", "Late", "Absent", "Outside"] as FilterStatus[]).map(f => (
            <button
              key={f}
              className={`map-filter-tab ${filter === f ? "active" : ""} tab-${f.toLowerCase().replace(" ", "-")}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="map-error">{error}</div>}

      {/* MAIN GRID */}
      <div className="map-grid">

        {/* LEFT — Mock Map */}
        <div className="map-container">
          <div className="mock-map">
            <div className="mock-map-pins">
              {staff.filter(s => s.status === "On Site" || s.status === "Late").slice(0, 8).map((s, i) => (
                <div
                  key={s.id}
                  className={`mock-pin mock-pin-${s.status === "On Site" ? "onsite" : "late"}`}
                  style={{
                    top:  `${20 + (i % 4) * 18}%`,
                    left: `${15 + Math.floor(i / 4) * 40}%`,
                  }}
                  title={s.name}
                >
                  <MapPin size={16} />
                  <span>{s.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
            <div className="mock-map-overlay">
              <Users size={36} />
              <p>Factory Floor Map</p>
              <span>{summary.onSite + summary.late} staff checked in today</span>
            </div>
          </div>

          {/* Map legend */}
          <div className="map-legend">
            <span className="legend-item"><span className="legend-dot dot-onsite" />On Site</span>
            <span className="legend-item"><span className="legend-dot dot-late"   />Late</span>
            <span className="legend-item"><span className="legend-dot dot-absent" />Absent</span>
            {summary.outside > 0 && (
              <span className="legend-item"><span className="legend-dot dot-outside"/>Outside</span>
            )}
          </div>
        </div>

        {/* RIGHT — Staff List */}
        <div className="map-staff-list">

          {loading ? (
            <div className="map-loading">
              <Loader2 size={20} className="spin" /> Loading staff...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No staff found.</div>
          ) : (
            filtered.map(member => (
              <div key={member.id} className={`staff-card staff-card-${member.status.toLowerCase().replace(" ", "-")}`}>

                <div className="staff-left">
                  <div className="staff-avatar">
                    {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="staff-info">
                    <h4>{member.name}</h4>
                    <p>{member.department}</p>
                    <span className="staff-location">
                      <MapPin size={11} /> {member.location}
                    </span>
                    {member.shift && (
                      <span className="staff-shift">
                        <Clock size={11} /> {member.shift}
                      </span>
                    )}
                  </div>
                </div>

                <div className="staff-right">
                  <span className={`status-badge status-${member.status.toLowerCase().replace(" ", "-")}`}>
                    {STATUS_CONFIG[member.status].icon}
                    {member.status}
                  </span>
                  <div className="staff-times">
                    <span className="check-in-time">
                      <Clock size={10} /> {member.lastCheckIn}
                    </span>
                    {member.checkOut && (
                      <span className="check-out-time">Out: {member.checkOut}</span>
                    )}
                  </div>
                  {member.distance !== null && (
                    <span className="staff-distance">{member.distance}m from site</span>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}