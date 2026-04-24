"use client";

import "@/styles/admin-org-chart.css";
import { Building2, Users, User, Zap } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Manager {
  id: number;
  full_name: string;
  manager_type: string;
  manager_title: string;
  dept_count: number;
}

interface Department {
  id: number;
  name: string;
  supervisor_id: number | null;
  supervisor_name: string | null;
  manager_id: number | null;
  manager_name: string | null;
  staff_count: number;
  description: string;
}

const ADMIN_API = "http://localhost/etms/controllers/admin";

export default function OrgChartPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrgData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [managersRes, deptsRes] = await Promise.all([
        fetch(`${ADMIN_API}/manager-roles.php`, { credentials: "include" }),
        fetch(`${ADMIN_API}/departments.php`, { credentials: "include" })
      ]);

      const managersJson = await managersRes.json();
      const deptsJson = await deptsRes.json();

      if (managersJson.success) {
        setManagers(managersJson.managers || []);
      }

      if (deptsJson.success) {
        setDepartments(deptsJson.departments || []);
      }

      if (!managersJson.success || !deptsJson.success) {
        setError("Failed to load organizational data");
      }
    } catch {
      setError("Unable to load organizational structure");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgData();
  }, [fetchOrgData]);

  const managerA = managers.find(m => m.manager_type === 'operations');
  const managerB = managers.find(m => m.manager_type === 'commercial');

  const getTotalStaff = () => {
    return departments.reduce((sum, d) => sum + (d.staff_count || 0), 0);
  };

  return (
    <div className="org-chart-container">
      {/* HEADER */}
      <div className="org-chart-header">
        <div>
          <h1><Building2 size={28} /> Organizational Chart</h1>
          <p>Royal Mabati Factory - Complete Organizational Structure</p>
        </div>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '24px' }}>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading organizational structure...</p>
        </div>
      ) : (
        <div className="org-structure">
          {/* CEO/FACTORY LEVEL */}
          <div className="org-level">
            <motion.div
              className="org-box ceo-level"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Building2 size={32} />
              <h2>Royal Mabati Factory</h2>
              <p className="org-stat">{getTotalStaff()} Total Staff</p>
            </motion.div>
          </div>

          {/* MANAGERS LEVEL */}
          <div className="org-line horizontal-line" />

          <div className="org-level managers-level">
            {managerA && (
              <motion.div
                className="org-box manager-level operations"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="manager-badge operations-badge">Manager A</div>
                <User size={24} />
                <h3>{managerA.full_name}</h3>
                <p className="manager-title">Operations Manager (Technical)</p>
                <p className="manager-subtitle">Oversees {managerA.dept_count} department(s)</p>
              </motion.div>
            )}

            {managerB && (
              <motion.div
                className="org-box manager-level commercial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="manager-badge commercial-badge">Manager B</div>
                <User size={24} />
                <h3>{managerB.full_name}</h3>
                <p className="manager-title">Commercial Manager (Administrative)</p>
                <p className="manager-subtitle">Oversees {managerB.dept_count} department(s)</p>
              </motion.div>
            )}
          </div>

          {/* DEPARTMENTS LEVEL */}
          <div className="org-line horizontal-line" />

          <div className="org-level departments-level">
            <div className="departments-grid">
              {departments.map((dept, idx) => (
                <motion.div
                  key={dept.id}
                  className="org-box department-level"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="dept-header-org">
                    <Zap size={20} className="dept-icon" />
                    <h4>{dept.name}</h4>
                  </div>

                  <div className="dept-body-org">
                    {dept.supervisor_name && (
                      <div className="dept-role">
                        <span className="role-label">Supervisor:</span>
                        <span className="role-value">{dept.supervisor_name}</span>
                      </div>
                    )}

                    {dept.manager_name && (
                      <div className="dept-role">
                        <span className="role-label">Manager:</span>
                        <span className="role-value">{dept.manager_name}</span>
                      </div>
                    )}

                    <div className="dept-staff">
                      <Users size={16} />
                      <span>{dept.staff_count} Staff</span>
                    </div>
                  </div>

                  <p className="dept-desc-org">{dept.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SUMMARY STATS */}
          <motion.div
            className="org-summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="summary-stat">
              <span className="stat-label">Departments:</span>
              <span className="stat-value">{departments.length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Managers:</span>
              <span className="stat-value">{managers.filter(m => m.manager_type).length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Supervisors:</span>
              <span className="stat-value">{departments.filter(d => d.supervisor_name).length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Staff:</span>
              <span className="stat-value">{getTotalStaff()}</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
