"use client";

import "@/styles/admin-departments.css";
import { Plus, Edit2, Trash2, Users, MapPin, Loader2, AlertTriangle, Save, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Department {
  id: number;
  name: string;
  description: string;
  supervisor_id: number | null;
  supervisor_name: string | null;
  manager_id: number | null;
  manager_name: string | null;
  staff_count: number;
  created_at: string;
  updated_at: string;
}

interface StaffMember {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

const ADMIN_API = "http://localhost/etms/controllers/admin";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    supervisor_id: "",
    manager_id: ""
  });

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API}/departments.php`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setDepartments(json.departments || []);
      } else {
        setError(json.error || "Failed to load departments");
      }
    } catch {
      setError("Unable to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaffMembers = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/get-staff.php`, { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setStaffMembers(json.staff || []);
      }
    } catch {
      console.error("Failed to fetch staff");
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchStaffMembers();
  }, [fetchDepartments, fetchStaffMembers]);

  const handleEditDept = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      supervisor_id: dept.supervisor_id?.toString() || "",
      manager_id: dept.manager_id?.toString() || ""
    });
    setShowForm(true);
  };

  const handleNewDept = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      description: "",
      supervisor_id: "",
      manager_id: ""
    });
    setShowForm(true);
  };

  const handleSaveDept = async () => {
    if (!formData.name.trim()) {
      setError("Department name is required");
      return;
    }

    try {
      const res = await fetch(`${ADMIN_API}/departments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: editingDept?.id,
          name: formData.name,
          description: formData.description,
          supervisor_id: formData.supervisor_id || null,
          manager_id: formData.manager_id || null
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        fetchDepartments();
      } else {
        setError(json.error || "Failed to save department");
      }
    } catch {
      setError("Error saving department");
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const res = await fetch(`${ADMIN_API}/departments.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id })
      });

      const json = await res.json();
      if (json.success) {
        fetchDepartments();
      } else {
        setError(json.error || "Failed to delete department");
      }
    } catch {
      setError("Error deleting department");
    }
  };

  return (
    <div className="admin-departments-container">
      {/* HEADER */}
      <div className="admin-departments-header">
        <div>
          <h1><MapPin size={28} /> Department Management</h1>
          <p>Manage organization structure, supervisors, and staff allocation</p>
        </div>
        <button className="btn-primary" onClick={handleNewDept}>
          <Plus size={18} /> Add Department
        </button>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="alert-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="shift-state-container loading">
          <Loader2 size={24} className="spin" />
          <p>Loading departments...</p>
        </div>
      )}

      {/* DEPARTMENTS GRID */}
      {!loading && departments.length > 0 && (
        <div className="departments-grid">
          {departments.map((dept, idx) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="department-card"
            >
              <div className="dept-header">
                <h3>{dept.name}</h3>
                <div className="dept-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEditDept(dept)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDeleteDept(dept.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="dept-description">{dept.description}</p>

              <div className="dept-info">
                <div className="info-item">
                  <span className="label">Supervisor:</span>
                  <span className="value">{dept.supervisor_name || "Not assigned"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Manager:</span>
                  <span className="value">{dept.manager_name || "Not assigned"}</span>
                </div>
                <div className="info-item">
                  <span className="label"><Users size={14} /> Staff:</span>
                  <span className="value badge">{dept.staff_count}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h2>{editingDept ? "Edit Department" : "New Department"}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Department Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter department name"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter department description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Supervisor</label>
                <select
                  value={formData.supervisor_id}
                  onChange={e => setFormData({ ...formData, supervisor_id: e.target.value })}
                >
                  <option value="">Select supervisor</option>
                  {staffMembers
                    .filter(m => !m.role || m.role === "Supervisor")
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Manager</label>
                <select
                  value={formData.manager_id}
                  onChange={e => setFormData({ ...formData, manager_id: e.target.value })}
                >
                  <option value="">Select manager</option>
                  {staffMembers
                    .filter(m => m.role === "Manager")
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveDept}>
                <Save size={16} /> Save Department
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {!loading && departments.length === 0 && (
        <div className="empty-state">
          <MapPin size={48} />
          <h2>No departments found</h2>
          <p>Create your first department to get started</p>
        </div>
      )}
    </div>
  );
}
