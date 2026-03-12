"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import "@/styles/hr-profiles.css";
import {
  Search, User, Phone, Mail, Building,
  Briefcase, Download, Loader2, RefreshCw,
  Filter, Users, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */

interface StaffProfile {
  id:             string;
  employeeNo:     string;
  name:           string;
  email:          string;
  phone:          string;
  department:     string;
  role:           string;
  status:         "Active" | "Inactive" | "Suspended" | "Exited";
  attendanceRate: number;
  lastCheckIn:    string;
  joinedOn:       string;
}

type Summary = { total: number; active: number; inactive: number };

const API = "http://localhost/etms/controllers/hr";

/* ─── Component ─────────────────────────────────────────── */

export default function HRProfilesTablePage() {

  const [profiles,    setProfiles]    = useState<StaffProfile[]>([]);
  const [summary,     setSummary]     = useState<Summary>({ total: 0, active: 0, inactive: 0 });
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles,       setRoles]       = useState<string[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [exporting,   setExporting]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [deptFilter,  setDeptFilter]  = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [roleFilter,  setRoleFilter]  = useState("");

  /* ── Fetch ── */
  const fetchProfiles = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({
        search: search, department: deptFilter,
        status: statusFilter, role: roleFilter,
      });
      const res  = await fetch(`${API}/get-hr-profiles.php?${params}`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
        setSummary(data.summary);
        setDepartments(data.departments || []);
        setRoles(data.roles || []);
      } else {
        setError(data.error || "Failed to load profiles.");
      }
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, [search, deptFilter, statusFilter, roleFilter]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  /* ── Export ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ department: deptFilter, status: statusFilter });
      const res    = await fetch(`${API}/export-hr-profiles.php?${params}`, { credentials: "include" });
      if (!res.ok) { alert("Export failed."); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href  = URL.createObjectURL(blob);
      link.download = `Royal_Mabati_Staff_Profiles_${new Date().toISOString().split("T")[0]}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { alert("Export failed."); }
    finally  { setExporting(false); }
  };

  /* ── Client search ── */
  const filtered = useMemo(() =>
    profiles.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeNo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ),
    [profiles, search]
  );

  const rateColor = (rate: number) =>
    rate >= 80 ? "rate-good" : rate >= 60 ? "rate-warn" : "rate-bad";

  /* ── Render ── */
  return (
    <div className="hr-table-container">

      {/* HEADER */}
      <div className="hr-table-header">
        <div>
          <h1><Users size={22} /> Staff Profiles</h1>
          <p>Royal Mabati ETMS Workforce Records</p>
        </div>
        <div className="hr-header-actions">
          <button className="hr-refresh-btn" onClick={fetchProfiles} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
          <button className="hr-export-btn" onClick={handleExport} disabled={exporting}>
            {exporting
              ? <><Loader2 size={14} className="spin" /> Exporting...</>
              : <><Download size={14} /> Export Excel</>
            }
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="hr-profile-summary">
        <div className="hr-ps-card total">
          <Users size={18} /><div><h3>{summary.total}</h3><p>Total Staff</p></div>
        </div>
        <div className="hr-ps-card active">
          <CheckCircle2 size={18} /><div><h3>{summary.active}</h3><p>Active</p></div>
        </div>
        <div className="hr-ps-card inactive">
          <XCircle size={18} /><div><h3>{summary.inactive}</h3><p>Inactive / Exited</p></div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="hr-filters">
        <div className="hr-search-box">
          <Search size={14} />
          <input
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="hr-filter-box">
          <Filter size={13} />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="hr-filter-box">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="hr-filter-box">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="exited">Exited</option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="hr-error-msg"><AlertCircle size={14} /> {error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="hr-table-loading">
          <Loader2 size={20} className="spin" /> Loading profiles...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
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
                <th>Attendance (30d)</th>
                <th>Last Check-In</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(staff => (
                <tr key={staff.id} className={`profile-row-${staff.status.toLowerCase()}`}>
                  <td><span className="emp-no">{staff.employeeNo}</span></td>
                  <td className="name-cell">
                    <div className="name-avatar">
                      {staff.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    {staff.name}
                  </td>
                  <td><span className="icon-cell"><Mail size={13} />{staff.email}</span></td>
                  <td><span className="icon-cell"><Phone size={13} />{staff.phone}</span></td>
                  <td><span className="icon-cell"><Building size={13} />{staff.department}</span></td>
                  <td><span className="icon-cell"><Briefcase size={13} />{staff.role}</span></td>
                  <td>
                    <div className="rate-wrap">
                      <div className={`rate-bar ${rateColor(staff.attendanceRate)}`}
                           style={{ width: `${staff.attendanceRate}%` }} />
                      <span className={`rate-pct ${rateColor(staff.attendanceRate)}`}>
                        {staff.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  <td><span className="last-seen">{staff.lastCheckIn}</span></td>
                  <td>
                    <span className={`status ${staff.status.toLowerCase()}`}>
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !error && (
            <div className="empty-state">No staff profiles found.</div>
          )}
        </div>
      )}

    </div>
  );
}