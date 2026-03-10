"use client";

import { useState } from "react";
import "@/styles/admin-roles.css";
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Search
} from "lucide-react";

export default function RolesPage() {

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const [roles, setRoles] = useState([
    { id: 1, name: "Administrator", description: "Full system access", users: 3 },
    { id: 2, name: "HR Manager", description: "Manage employees and attendance", users: 5 },
    { id: 3, name: "Supervisor", description: "Monitor assigned staff", users: 8 }
  ]);

  /* ================= SAVE ROLE ================= */

  const handleSaveRole = () => {

    if (!roleName.trim() || !roleDesc.trim()) return;

    setLoading(true);

    setTimeout(() => {
      const newRole = {
        id: roles.length + 1,
        name: roleName,
        description: roleDesc,
        users: 0
      };

      setRoles([...roles, newRole]);

      // Reset
      setRoleName("");
      setRoleDesc("");
      setLoading(false);
      setShowModal(false);

    }, 800); // simulate API
  };

  return (
    <div className="admin-roles-container">

      {/* HEADER */}
      <div className="admin-roles-header">
        <h1><ShieldCheck size={28}/> Roles & Permissions</h1>
        <p>Manage access control and permission levels across the system</p>
      </div>

      {/* CONTROLS */}
      <div className="admin-roles-controls">

        <div className="search-box">
          <Search size={18}/>
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="create-role-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18}/> Create Role
        </button>
      </div>

      {/* ROLE TABLE */}
      <div className="roles-card">
        <table className="roles-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Description</th>
              <th>Users Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles
              .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
              .map(role => (
              <tr key={role.id}>
                <td><span className="role-badge">{role.name}</span></td>
                <td>{role.description}</td>
                <td>{role.users}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn"><Edit size={16}/></button>
                    <button className="delete-btn"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE ROLE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Role</h3>

            <input
              type="text"
              placeholder="Role Name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />

            <textarea
              placeholder="Role Description"
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                className="primary"
                onClick={handleSaveRole}
                disabled={!roleName.trim() || !roleDesc.trim() || loading}
              >
                {loading ? "Saving..." : "Save Role"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}