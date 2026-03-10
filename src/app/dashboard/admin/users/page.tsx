"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  Plus,
  Download,
} from "lucide-react";
import "@/styles/admin-users.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Disabled";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    setUsers([
      { id: "1", name: "John Mwangi", email: "john@royalmabati.co.ke", role: "Supervisor", status: "Active" },
      { id: "2", name: "Grace Achieng", email: "grace@royalmabati.co.ke", role: "HR", status: "Disabled" },
      { id: "3", name: "Peter Otieno", email: "peter@royalmabati.co.ke", role: "Manager", status: "Active" },
      { id: "4", name: "Jane Njeri", email: "jane@royalmabati.co.ke", role: "Admin", status: "Active" },
      { id: "5", name: "David Kimani", email: "david@royalmabati.co.ke", role: "Supervisor", status: "Active" },
      { id: "6", name: "Mercy Atieno", email: "mercy@royalmabati.co.ke", role: "HR", status: "Active" },
    ]);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" }
          : u
      )
    );
  };

  const deleteUser = () => {
    if (!currentUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    setShowDeleteModal(false);
  };

  const exportCSV = () => {
    const csv =
      "Name,Email,Role,Status\n" +
      users.map((u) => `${u.name},${u.email},${u.role},${u.status}`).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>Users Management</h1>
        <p>Royal Mabati Factory • Admin Panel</p>
      </div>

      <div className="admin-users-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="right-actions">
          <button onClick={exportCSV} className="export-btn">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowInviteModal(true)} className="invite-btn">
            <Plus size={16} /> Invite User
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((u) => (
              <tr key={u.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(u.id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked
                          ? [...prev, u.id]
                          : prev.filter((id) => id !== u.id)
                      )
                    }
                  />
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={u.status === "Active"}
                      onChange={() => toggleStatus(u.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        setCurrentUser(u);
                        setShowEditModal(true);
                      }}
                      className="edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => alert("Password reset sent")}
                      className="reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentUser(u);
                        setShowDeleteModal(true);
                      }}
                      className="delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {currentUser?.name}?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="danger" onClick={deleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Invite New User</h3>
            <input placeholder="Full Name" />
            <input placeholder="Email Address" />
            <select>
              <option>Supervisor</option>
              <option>HR</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}