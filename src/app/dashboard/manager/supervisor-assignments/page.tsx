"use client";

import "@/styles/manager-supervisor-assignment.css";
import { Users, Edit2, Trash2, Loader2, AlertTriangle, Save, X, UserCheck } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";

interface Department {
  id: number;
  name: string;
  description: string;
  supervisor_id: number | null;
  supervisor_name: string | null;
  manager_id: number | null;
  manager_name: string | null;
  staff_count: number;
  manager_type: string;
}

interface Supervisor {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

const ADMIN_API = "/admin";

export default function ManagerSupervisorAssignmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await apiGet(`${ADMIN_API}/supervisor-assignments.php`);
      if (json.success) {
        setDepartments(json.departments || []);
      } else {
        setError(json.error || "Failed to load departments");
      }
    } catch (err: any) {
      setError(err.message || "Unable to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSupervisors = useCallback(async () => {
    try {
      console.log('Fetching supervisors from:', `${ADMIN_API}/get-staff.php`);
      const json = await apiGet(`${ADMIN_API}/get-staff.php`);
      console.log('Supervisors response:', json);
      if (json.success) {
        const supervisors = json.staff?.filter((s: any) => s.role?.toLowerCase() === 'supervisor') || [];
        console.log('Filtered supervisors:', supervisors);
        setSupervisors(supervisors);
      } else {
        console.error("Failed to fetch supervisors:", json.error);
        setError(json.error || "Failed to fetch supervisors");
      }
    } catch (err: any) {
      console.error("Failed to fetch supervisors exception:", err);
      setError(err.message || "Failed to fetch supervisors");
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchSupervisors();
  }, [fetchDepartments, fetchSupervisors]);

  const handleAssignSupervisor = async (departmentId: number, supervisorId: number) => {
    try {
      const json = await apiPost(`${ADMIN_API}/supervisor-assignments.php`, {
        department_id: departmentId,
        supervisor_id: supervisorId
      });

      if (json.success) {
        setSuccessMessage("Supervisor assigned successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setEditingId(null);
        setSelectedSupervisor(null);
        fetchDepartments();
      } else {
        setError(json.error || "Failed to assign supervisor");
      }
    } catch (err: any) {
      setError(err.message || "Error assigning supervisor");
    }
  };

  const handleRemoveSupervisor = async (departmentId: number) => {
    if (!confirm("Remove this supervisor assignment?")) return;

    try {
      const json = await apiDelete(`${ADMIN_API}/supervisor-assignments.php`, {
        body: JSON.stringify({ department_id: departmentId })
      });

      if (json.success) {
        setSuccessMessage("Supervisor removed successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchDepartments();
      } else {
        setError(json.error || "Failed to remove supervisor");
      }
    } catch (err: any) {
      setError(err.message || "Error removing supervisor");
    }
  };

  return (
    <div className="manager-assignment-container">
      {/* HEADER */}
      <div className="manager-assignment-header">
        <div>
          <h1><UserCheck size={28} /> Assign Supervisors to Departments</h1>
          <p>Manage supervisor assignments within your departments</p>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <motion.div className="alert alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={() => setError("")}><X size={16} /></button>
        </motion.div>
      )}

      {successMessage && (
        <motion.div className="alert alert-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <UserCheck size={20} />
          <p>{successMessage}</p>
        </motion.div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-container">
          <Loader2 size={24} className="spin" />
          <p>Loading departments...</p>
        </div>
      )}

      {/* DEPARTMENTS LIST */}
      {!loading && departments.length > 0 && (
        <div className="departments-list">
          {departments.map((dept, idx) => (
            <motion.div
              key={dept.id}
              className="dept-assignment-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="card-header">
                <div>
                  <h3>{dept.name}</h3>
                  <p className="dept-desc">{dept.description}</p>
                </div>
                <span className={`manager-type-badge ${dept.manager_type}`}>
                  {dept.manager_type === 'operations' ? 'Operations' : 'Commercial'}
                </span>
              </div>

              <div className="card-info">
                <div className="info-row">
                  <span className="label">Current Supervisor:</span>
                  <span className="value">
                    {dept.supervisor_name ? (
                      <span className="supervisor-badge">{dept.supervisor_name}</span>
                    ) : (
                      <span className="empty-value">Not assigned</span>
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Staff:</span>
                  <span className="value">{dept.staff_count}</span>
                </div>
              </div>

              <div className="card-actions">
                {editingId === dept.id ? (
                  <div className="supervisor-select">
                    <select
                      value={selectedSupervisor || ""}
                      onChange={e => setSelectedSupervisor(e.target.value ? parseInt(e.target.value) : null)}
                      autoFocus
                    >
                      <option value="">Select a supervisor...</option>
                      {supervisors.map(s => {
                        // Check if supervisor is already assigned to another department
                        const isAlreadyAssigned = departments.some(d => d.supervisor_id === s.id && d.id !== dept.id);
                        return (
                          <option key={s.id} value={s.id} disabled={isAlreadyAssigned}>
                            {s.full_name}{isAlreadyAssigned ? ' (already assigned)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      className="btn-save"
                      onClick={() => {
                        if (selectedSupervisor) {
                          handleAssignSupervisor(dept.id, selectedSupervisor);
                        }
                      }}
                      disabled={!selectedSupervisor}
                    >
                      <Save size={16} /> Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => {
                        setEditingId(null);
                        setSelectedSupervisor(null);
                      }}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setEditingId(dept.id);
                        setSelectedSupervisor(dept.supervisor_id);
                      }}
                    >
                      <Edit2 size={16} /> {dept.supervisor_name ? 'Change' : 'Assign'}
                    </button>
                    {dept.supervisor_id && (
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveSupervisor(dept.id)}
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && departments.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h2>No departments assigned to you</h2>
          <p>You currently don't have any departments to manage</p>
        </div>
      )}
    </div>
  );
}
