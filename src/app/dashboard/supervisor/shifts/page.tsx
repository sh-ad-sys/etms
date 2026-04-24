"use client";

import "@/styles/admin-shifts.css";
import { Clock, CalendarDays, Plus, Settings, Timer, Loader2, AlertTriangle, RefreshCw, X, Users, Check, Copy } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface ShiftItem {
  id: number;
  name: string;
  startLabel: string;
  endLabel: string;
  break: string;
  overtimeAfterLabel: string;
  grace?: number;
  status: string;
}

interface ComplianceRules {
  maxWeeklyHours: number;
  overtimeRate: number;
  graceMinutes: number;
}

interface WeeklySchedule {
  [key: string]: string;
}

interface TeamMember {
  id: number;
  full_name: string;
  employeeCode: string;
  department: string;
  assignments?: WeeklySchedule;
}

const ADMIN_API = "http://localhost/etms/controllers/admin";
const SUPERVISOR_API = "http://localhost/etms/controllers/supervisor";

const SHIFT_TYPES = ["Morning Shift", "Evening Shift", "Night Shift"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type ViewMode = "overview" | "individual" | "bulk";

export default function SupervisorShiftsPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRules>({
    maxWeeklyHours: 48,
    overtimeRate: 150,
    graceMinutes: 15
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [supervisorDepartment, setSupervisorDepartment] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [error, setError] = useState("");
  
  // Team member shift allocation state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberSchedule, setMemberSchedule] = useState<WeeklySchedule>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");
  
  // Bulk assignment state
  const [bulkSelectedMembers, setBulkSelectedMembers] = useState<Set<number>>(new Set());
  const [bulkSchedule, setBulkSchedule] = useState<WeeklySchedule>({
    Monday: "Morning Shift",
    Tuesday: "Morning Shift",
    Wednesday: "Morning Shift",
    Thursday: "Morning Shift",
    Friday: "Morning Shift",
    Saturday: "Morning Shift",
    Sunday: "Morning Shift",
  });
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setSupervisorDepartment(json.department || "");
      }
    } catch {
      console.error("Failed to fetch profile");
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch(`${SUPERVISOR_API}/get-workers.php`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        // Filter team members to only show those from the same department
        const sameDepartmentWorkers = (json.workers || []).filter(
          worker => worker.department === supervisorDepartment
        );
        setTeamMembers(sameDepartmentWorkers);
      }

      // Also fetch current assignments
      try {
        const assignRes = await fetch(`${SUPERVISOR_API}/get-shift-assignments.php`, { credentials: "include" });
        const assignJson = await assignRes.json();
        if (assignJson.success && assignJson.assignments) {
          const sameDepartmentAssignments = assignJson.assignments.filter(
            assignment => assignment.department === supervisorDepartment
          );
          setTeamMembers(sameDepartmentAssignments);
        }
      } catch {
        console.error("Failed to fetch assignments");
      }
    } catch {
      console.error("Failed to fetch team members");
    }
  }, [supervisorDepartment]);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API}/get-shifts.php`, { credentials: "include" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to load shifts.");
        return;
      }
      setShifts(json.shifts || []);
      if (json.complianceRules) {
        setComplianceRules(json.complianceRules);
      }
    } catch {
      setError("Unable to load shifts.");
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (supervisorDepartment) {
      fetchTeamMembers();
    }
  }, [supervisorDepartment, fetchTeamMembers]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleSelectMember = (member: TeamMember) => {
    setViewMode("individual");
    setSelectedMember(member);
    setMemberSchedule(member.assignments || DAYS.reduce((acc, day) => ({ ...acc, [day]: "Morning Shift" }), {}));
    setSelectedDay(null);
  };

  const toggleBulkSelection = (memberId: number) => {
    const newSelected = new Set(bulkSelectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setBulkSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (bulkSelectedMembers.size === teamMembers.length) {
      setBulkSelectedMembers(new Set());
    } else {
      setBulkSelectedMembers(new Set(teamMembers.map(m => m.id)));
    }
  };

  const handleMemberDayShiftChange = (day: string, newShift: string) => {
    setMemberSchedule(prev => ({
      ...prev,
      [day]: newShift
    }));
    setSelectedDay(null);
  };

  const handleSaveMemberShifts = async () => {
    if (!selectedMember) return;
    
    setSaving(true);
    setSavingMessage("");
    try {
      const res = await fetch(`${SUPERVISOR_API}/assign-shifts.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workerId: selectedMember.id,
          shiftAssignments: memberSchedule
        })
      });
      
      const json = await res.json();
      if (json.success) {
        setSavingMessage(`Shifts assigned to ${selectedMember.full_name} successfully!`);
        setTimeout(() => {
          setSavingMessage("");
          setSelectedMember(null);
          fetchTeamMembers();
        }, 2000);
      } else {
        setSavingMessage(json.error || "Failed to save shifts");
      }
    } catch {
      setSavingMessage("Error saving shifts");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAssignShifts = async () => {
    if (bulkSelectedMembers.size === 0) return;
    
    setBulkSaving(true);
    setBulkMessage("");
    try {
      const res = await fetch(`${SUPERVISOR_API}/bulk-assign-shifts.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workerIds: Array.from(bulkSelectedMembers),
          shiftAssignments: bulkSchedule
        })
      });
      
      const json = await res.json();
      if (json.success) {
        setBulkMessage(`Shifts assigned to ${json.workersCount} workers successfully!`);
        setTimeout(() => {
          setBulkMessage("");
          setBulkSelectedMembers(new Set());
          fetchTeamMembers();
          setViewMode("overview");
        }, 2000);
      } else {
        setBulkMessage(json.error || "Failed to save shifts");
      }
    } catch {
      setBulkMessage("Error saving shifts");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="admin-shifts-container">
      {/* HEADER */}
      <div className="admin-shifts-header">
        <div>
          <h1><Clock size={28} /> Shift Management</h1>
          <p>Configure shifts and allocate to your team members</p>
        </div>
        <button className="shift-refresh-btn" onClick={fetchShifts} disabled={loading} title="Refresh">
          <RefreshCw size={18} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="shift-state-container loading">
          <Loader2 size={24} className="spin" />
          <p>Loading shifts and team...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="shift-state-container error">
          <AlertTriangle size={24} />
          <p>{error}</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!loading && !error && (
        <>
          {/* SHIFTS GRID */}
          <div className="shift-grid">
            {shifts.map((shift, idx) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="shift-card"
              >
                <div className="shift-card-header">
                  <h3>{shift.name}</h3>
                  <div className="header-badges">
                    <span className={`status-badge ${shift.status?.toLowerCase()}`}>{shift.status}</span>
                    <span className="grace-badge">{complianceRules.graceMinutes}m grace</span>
                  </div>
                </div>

                <div className="shift-info">
                  <div className="info-row">
                    <Clock size={18} />
                    <div>
                      <span className="info-label">Working Hours</span>
                      <span className="info-value">{shift.startLabel} - {shift.endLabel}</span>
                    </div>
                  </div>

                  <div className="info-row">
                    <Timer size={18} />
                    <div>
                      <span className="info-label">Break Duration</span>
                      <span className="info-value">{shift.break}</span>
                    </div>
                  </div>

                  <div className="info-row">
                    <CalendarDays size={18} />
                    <div>
                      <span className="info-label">Overtime After</span>
                      <span className="info-value">{shift.overtimeAfterLabel}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* TEAM MEMBERS SECTION */}
          <div className="team-shifts-section">
            <div className="section-header">
              <h2 className="section-title"><Users size={20} /> Team Members</h2>
              <div className="mode-tabs">
                <button 
                  className={`mode-tab ${viewMode === "overview" ? "active" : ""}`}
                  onClick={() => { setViewMode("overview"); setSelectedMember(null); setBulkSelectedMembers(new Set()); }}
                >
                  Overview
                </button>
                <button 
                  className={`mode-tab ${viewMode === "individual" ? "active" : ""}`}
                  onClick={() => setViewMode("individual")}
                >
                  Individual
                </button>
                <button 
                  className={`mode-tab ${viewMode === "bulk" ? "active" : ""}`}
                  onClick={() => { setViewMode("bulk"); setSelectedMember(null); }}
                >
                  Bulk Assignment
                </button>
              </div>
            </div>
            
            {teamMembers.length === 0 ? (
              <div className="team-empty-state">
                <Users size={28} />
                <p>No team members found</p>
              </div>
            ) : (
              <div className="team-members-grid">
                {viewMode === "bulk" && (
                  <div className="bulk-select-all-card">
                    <input 
                      type="checkbox" 
                      checked={bulkSelectedMembers.size === teamMembers.length && teamMembers.length > 0}
                      onChange={toggleSelectAll}
                    />
                    <label>Select All {teamMembers.length} Members</label>
                  </div>
                )}
                {teamMembers.map(member => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`team-member-card 
                      ${selectedMember?.id === member.id && viewMode === "individual" ? 'active' : ''} 
                      ${bulkSelectedMembers.has(member.id) && viewMode === "bulk" ? 'bulk-active' : ''}
                      ${viewMode === 'bulk' ? 'bulk-mode' : ''}`}
                    onClick={() => {
                      if (viewMode === "bulk") {
                        toggleBulkSelection(member.id);
                      } else {
                        handleSelectMember(member);
                      }
                    }}
                  >
                    {viewMode === "bulk" && (
                      <input 
                        type="checkbox" 
                        checked={bulkSelectedMembers.has(member.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleBulkSelection(member.id);
                        }}
                        className="bulk-checkbox"
                      />
                    )}
                    <div className="member-avatar">{member.full_name.charAt(0)}</div>
                    <div className="member-info">
                      <h4>{member.full_name}</h4>
                      <p className="member-code">{member.employeeCode}</p>
                      <p className="member-dept">{member.department}</p>
                      {member.assignments && viewMode === "overview" && (
                        <p className="member-shifts">
                          {member.assignments.Monday || 'Not set'}
                        </p>
                      )}
                    </div>
                    {selectedMember?.id === member.id && viewMode === "individual" && (
                      <div className="member-selected-indicator">
                        <Check size={16} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* MEMBER SHIFT ALLOCATION */}
          {selectedMember && (
            <div className="member-allocation-section">
              <div className="allocation-header">
                <h2>Allocate Shifts: {selectedMember.full_name}</h2>
                <button 
                  className="btn-secondary" 
                  onClick={() => setSelectedMember(null)}
                  type="button"
                >
                  <X size={16} /> Close
                </button>
              </div>

              <div className="week-grid">
                {DAYS.map((day, index) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="day-card"
                  >
                    <h4>{day.slice(0, 3)}</h4>
                    <p className="day-shift">{memberSchedule[day] || "not set"}</p>
                    <button 
                      className="btn-secondary-small" 
                      type="button"
                      onClick={() => setSelectedDay(day)}
                    >
                      Change
                    </button>

                    {/* SHIFT SELECTOR MODAL */}
                    {selectedDay === day && (
                      <div className="shift-selector-modal">
                        <div className="modal-backdrop" onClick={() => setSelectedDay(null)} />
                        <div className="modal-content">
                          <div className="modal-header">
                            <h3>Select Shift for {day}</h3>
                            <button className="modal-close" onClick={() => setSelectedDay(null)}>
                              <X size={18} />
                            </button>
                          </div>
                          <div className="shift-options">
                            {SHIFT_TYPES.map(shiftType => (
                              <button
                                key={shiftType}
                                className={`shift-option ${memberSchedule[day] === shiftType ? 'active' : ''}`}
                                onClick={() => handleMemberDayShiftChange(day, shiftType)}
                              >
                                {shiftType}
                              </button>
                            ))}
                            <button
                              className="shift-option no-shift"
                              onClick={() => handleMemberDayShiftChange(day, "Not in Shift")}
                            >
                              Not in Shift
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="allocation-footer">
                {savingMessage && (
                  <div className={`save-message ${savingMessage.includes("successfully") ? "success" : "error"}`}>
                    {savingMessage}
                  </div>
                )}
                <button 
                  className="btn-primary" 
                  onClick={handleSaveMemberShifts}
                  disabled={saving}
                  type="button"
                >
                  {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Check size={16} /> Save Shifts</>}
                </button>
              </div>
            </div>
          )}

          {/* BULK SHIFT ALLOCATION */}
          {viewMode === "bulk" && (
            <div className="member-allocation-section">
              <div className="allocation-header">
                <h2><Copy size={18} /> Bulk Assign Shifts</h2>
                <span className="bulk-count">{bulkSelectedMembers.size} selected</span>
              </div>

              {bulkSelectedMembers.size > 0 ? (
                <>
                  <div className="week-grid">
                    {DAYS.map((day, index) => (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.03 }}
                        className="day-card"
                      >
                        <h4>{day.slice(0, 3)}</h4>
                        <p className="day-shift">{bulkSchedule[day]}</p>
                        <button 
                          className="btn-secondary-small" 
                          type="button"
                          onClick={() => setSelectedDay(day)}
                        >
                          Change
                        </button>

                        {/* SHIFT SELECTOR MODAL */}
                        {selectedDay === day && (
                          <div className="shift-selector-modal">
                            <div className="modal-backdrop" onClick={() => setSelectedDay(null)} />
                            <div className="modal-content">
                              <div className="modal-header">
                                <h3>Select Shift for {day}</h3>
                                <button className="modal-close" onClick={() => setSelectedDay(null)}>
                                  <X size={18} />
                                </button>
                              </div>
                              <div className="shift-options">
                                {SHIFT_TYPES.map(shiftType => (
                                  <button
                                    key={shiftType}
                                    className={`shift-option ${bulkSchedule[day] === shiftType ? 'active' : ''}`}
                                    onClick={() => {
                                      setBulkSchedule(prev => ({ ...prev, [day]: shiftType }));
                                      setSelectedDay(null);
                                    }}
                                  >
                                    {shiftType}
                                  </button>
                                ))}
                                <button
                                  className="shift-option no-shift"
                                  onClick={() => {
                                    setBulkSchedule(prev => ({ ...prev, [day]: "Not in Shift" }));
                                    setSelectedDay(null);
                                  }}
                                >
                                  Not in Shift
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="allocation-footer">
                    {bulkMessage && (
                      <div className={`save-message ${bulkMessage.includes("successfully") ? "success" : "error"}`}>
                        {bulkMessage}
                      </div>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={handleBulkAssignShifts}
                      disabled={bulkSaving}
                      type="button"
                    >
                      {bulkSaving ? <><Loader2 size={16} className="spin" /> Assigning...</> : <><Check size={16} /> Assign to {bulkSelectedMembers.size} Members</>}
                    </button>
                  </div>
                </>
              ) : (
                <div className="shift-state-container">
                  <AlertTriangle size={24} />
                  <p>Select team members to assign shifts in bulk</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
