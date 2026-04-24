"use client";

import "@/styles/admin-manager-roles.css";
import { Users, Award, Loader2, AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { apiDelete, apiGet, apiPost } from "@/lib/api-client";

interface Manager {
  id: number;
  full_name: string;
  email: string;
  department: string;
  manager_type: string | null;
  manager_title: string;
  dept_count: number;
}

interface StaffMember {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

type ManagerType = "operations" | "commercial";

const ADMIN_API = "/admin";

export default function ManagerRolesPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigningType, setAssigningType] = useState<ManagerType | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await apiGet(`${ADMIN_API}/manager-roles.php`);
      if (json.success) {
        setManagers(json.managers || []);
      } else {
        setError(json.error || "Failed to load managers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load managers");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaffForRoles = useCallback(async () => {
    try {
      const json = await apiGet(`${ADMIN_API}/get-staff.php`);
      if (json.success) {
        setStaffMembers(
          (json.staff || []).filter(
            (staff: StaffMember) => staff.role?.toLowerCase() === "manager"
          )
        );
      }
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
    fetchStaffForRoles();
  }, [fetchManagers, fetchStaffForRoles]);

  const handleOpenAssignment = (managerType: ManagerType) => {
    setAssigningType(managerType);
    setSelectedManagerId(null);
  };

  const handleCloseAssignment = () => {
    setAssigningType(null);
    setSelectedManagerId(null);
  };

  const handleAssignRole = async () => {
    if (!assigningType || !selectedManagerId) {
      setError("Select a manager to continue");
      return;
    }

    try {
      const json = await apiPost(`${ADMIN_API}/manager-roles.php`, {
        user_id: selectedManagerId,
        manager_type: assigningType,
      });

      if (json.success) {
        handleCloseAssignment();
        fetchManagers();
      } else {
        setError(json.error || "Failed to assign role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error assigning role");
    }
  };

  const handleRemoveRole = async (managerId: number) => {
    if (!confirm("Remove this manager role?")) return;

    try {
      const json = await apiDelete(`${ADMIN_API}/manager-roles.php`, {
        body: JSON.stringify({ user_id: managerId }),
      });

      if (json.success) {
        fetchManagers();
      } else {
        setError(json.error || "Failed to remove role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing role");
    }
  };

  const operationsManager = managers.find((manager) => manager.manager_type === "operations");
  const commercialManager = managers.find((manager) => manager.manager_type === "commercial");

  return (
    <div className="manager-roles-container">
      <div className="manager-roles-header">
        <div>
          <h1><Award size={28} /> Manager Role Assignment</h1>
          <p>Assign organizational roles to managers</p>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <Loader2 size={24} className="spin" />
          <p>Loading managers...</p>
        </div>
      )}

      {!loading && (
        <div className="manager-roles-grid">
          <motion.div
            className="manager-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="section-header operations">
              <Award size={24} />
              <div>
                <h2>Manager A</h2>
                <p>Operations Manager (Technical)</p>
              </div>
            </div>

            <div className="manager-card assigned-card">
              {operationsManager ? (
                <>
                  <div className="manager-info">
                    <h3>{operationsManager.full_name}</h3>
                    <p className="email">{operationsManager.email}</p>
                    <p className="dept">{operationsManager.dept_count} departments</p>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-reassign"
                      onClick={() => handleOpenAssignment("operations")}
                    >
                      Reassign
                    </button>
                    <button
                      className="btn-reassign"
                      onClick={() => handleRemoveRole(operationsManager.id)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </>
              ) : (
                <button className="btn-reassign" onClick={() => handleOpenAssignment("operations")}>
                  Assign Manager
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            className="manager-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="section-header commercial">
              <Users size={24} />
              <div>
                <h2>Manager B</h2>
                <p>Commercial Manager (Administrative)</p>
              </div>
            </div>

            <div className="manager-card assigned-card">
              {commercialManager ? (
                <>
                  <div className="manager-info">
                    <h3>{commercialManager.full_name}</h3>
                    <p className="email">{commercialManager.email}</p>
                    <p className="dept">{commercialManager.dept_count} departments</p>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-reassign"
                      onClick={() => handleOpenAssignment("commercial")}
                    >
                      Reassign
                    </button>
                    <button
                      className="btn-reassign"
                      onClick={() => handleRemoveRole(commercialManager.id)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </>
              ) : (
                <button className="btn-reassign" onClick={() => handleOpenAssignment("commercial")}>
                  Assign Manager
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {assigningType && (
        <div className="modal-overlay" onClick={handleCloseAssignment}>
          <motion.div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>{assigningType === "operations" ? "Assign Manager A" : "Assign Manager B"}</h2>
            <div className="modal-options">
              <button className="option-btn operations" disabled={assigningType !== "operations"}>
                <Award size={24} />
                <span>Manager A</span>
                <small>Operations (Technical)</small>
              </button>
              <button className="option-btn commercial" disabled={assigningType !== "commercial"}>
                <Users size={24} />
                <span>Manager B</span>
                <small>Commercial (Administrative)</small>
              </button>
            </div>

            <div className="manager-selection">
              <label>Select Manager:</label>
              <select
                value={selectedManagerId ?? ""}
                onChange={(event) =>
                  setSelectedManagerId(
                    event.target.value ? parseInt(event.target.value, 10) : null
                  )
                }
              >
                <option value="">Choose a manager...</option>
                {staffMembers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name} ({manager.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn-reassign"
              onClick={handleAssignRole}
              disabled={!selectedManagerId}
              type="button"
            >
              Save Assignment
            </button>

            <button className="btn-close" onClick={handleCloseAssignment}>
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
