"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Edit2, Trash2, RotateCcw,
  Plus, Download, Loader2, Users,
  CheckCircle2, XCircle, AlertCircle, RefreshCw,
} from "lucide-react";
import "@/styles/admin-users.css";

/* ─── Types ─────────────────────────────────────────────── */

interface User {
  id:           string;
  employeeCode: string;
  name:         string;
  email:        string;
  phone:        string;
  role:         string;
  roleId:       number | null;
  department:   string;
  status:       "Active" | "Suspended" | "Exited";
  joinedOn:     string;
}

interface Role { id: number; name: string; }

const API = "http://localhost/etms/controllers/admin";

/* ─── Component ─────────────────────────────────────────── */

export default function AdminUsersPage() {

  const [users,       setUsers]       = useState<User[]>([]);
  const [roles,       setRoles]       = useState<Role[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [actionLoad,  setActionLoad]  = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState("");
  const [exporting,   setExporting]   = useState(false);

  /* Filters */
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("");
  const [statusFilter,setStatusFilter]= useState("");
  const [page,        setPage]        = useState(1);
  const perPage = 10;

  /* Modals */
  const [showEdit,    setShowEdit]    = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [showInvite,  setShowInvite]  = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  /* Edit form */
  const [editName,   setEditName]   = useState("");
  const [editEmail,  setEditEmail]  = useState("");
  const [editPhone,  setEditPhone]  = useState("");
  const [editRoleId, setEditRoleId] = useState<number | null>(null);

  /* Invite form */
  const [invName,   setInvName]   = useState("");
  const [invEmail,  setInvEmail]  = useState("");
  const [invPhone,  setInvPhone]  = useState("");
  const [invRoleId, setInvRoleId] = useState<number | null>(null);
  const [invDept,   setInvDept]   = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  /* ── Fetch ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({
        search, role: roleFilter, status: statusFilter,
        page: String(page), perPage: String(perPage),
      });
      const res  = await fetch(`${API}/get-admin-users.php?${params}`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setRoles(data.roles || []);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else setError(data.error || "Failed to load users.");
    } catch { setError("Unable to connect."); }
    finally  { setLoading(false); }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Action helper ── */
  const doAction = async (payload: object): Promise<{ success: boolean; message?: string; error?: string }> => {
    setActionLoad(true);
    try {
      const res  = await fetch(`${API}/admin-users-actions.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch { return { success: false, error: "Network error." }; }
    finally  { setActionLoad(false); }
  };

  /* ── Toggle status ── */
  const toggleStatus = async (user: User) => {
    const newStatus = user.status === "Active" ? "SUSPENDED" : "ACTIVE";
    const res = await doAction({ action: "toggle_status", userId: user.id, newStatus });
    if (res.success) { showToast(res.message!); fetchUsers(); }
    else setError(res.error || "Failed.");
  };

  /* ── Edit user ── */
  const openEdit = (u: User) => {
    setCurrentUser(u);
    setEditName(u.name); setEditEmail(u.email);
    setEditPhone(u.phone); setEditRoleId(u.roleId);
    setShowEdit(true);
  };
  const submitEdit = async () => {
    if (!currentUser) return;
    const res = await doAction({
      action: "edit_user", userId: currentUser.id,
      name: editName, email: editEmail, phone: editPhone, roleId: editRoleId,
    });
    if (res.success) { showToast(res.message!); setShowEdit(false); fetchUsers(); }
    else setError(res.error || "Update failed.");
  };

  /* ── Delete ── */
  const submitDelete = async () => {
    if (!currentUser) return;
    const res = await doAction({ action: "delete_user", userId: currentUser.id });
    if (res.success) { showToast(res.message!); setShowDelete(false); fetchUsers(); }
    else setError(res.error || "Delete failed.");
  };

  /* ── Reset password ── */
  const resetPassword = async (user: User) => {
    if (!confirm(`Reset password for ${user.name}? A temporary password will be emailed.`)) return;
    const res = await doAction({ action: "reset_password", userId: user.id });
    if (res.success) showToast(res.message!);
    else setError(res.error || "Reset failed.");
  };

  /* ── Invite ── */
  const submitInvite = async () => {
    const res = await doAction({
      action: "invite_user", name: invName, email: invEmail,
      phone: invPhone, roleId: invRoleId, department: invDept,
    });
    if (res.success) {
      showToast(res.message!); setShowInvite(false);
      setInvName(""); setInvEmail(""); setInvPhone("");
      setInvRoleId(null); setInvDept("");
      fetchUsers();
    } else setError(res.error || "Invite failed.");
  };

  /* ── Export ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ role: roleFilter, status: statusFilter });
      const res    = await fetch(`${API}/export-admin-users.php?${params}`, { credentials: "include" });
      const blob   = await res.blob();
      const link   = document.createElement("a");
      link.href     = URL.createObjectURL(blob);
      link.download = `Royal_Mabati_Users_${new Date().toISOString().split("T")[0]}.xls`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { alert("Export failed."); }
    finally  { setExporting(false); }
  };

  /* ── Render ── */
  return (
    <div className="admin-users-container">

      {/* TOAST */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* HEADER */}
      <div className="admin-users-header">
        <div>
          <h1><Users size={22} /> Users Management</h1>
          <p>Royal Mabati Factory · Admin Panel · {total} users</p>
        </div>
        <button className="au-refresh-btn" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* CONTROLS */}
      <div className="admin-users-controls">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by name, email or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="au-filter-box">
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div className="au-filter-box">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="exited">Exited</option>
          </select>
        </div>
        <div className="right-actions">
          <button onClick={handleExport} className="export-btn" disabled={exporting}>
            {exporting ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
            Export
          </button>
          <button onClick={() => setShowInvite(true)} className="invite-btn">
            <Plus size={14} /> Invite User
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="au-error">
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {/* TABLE */}
      <div className="table-card">
        {loading ? (
          <div className="au-loading"><Loader2 size={20} className="spin" /> Loading users...</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={`user-row-${u.status.toLowerCase()}`}>
                  <td><span className="au-emp-code">{u.employeeCode || "—"}</span></td>
                  <td>
                    <div className="au-name-cell">
                      <div className="au-avatar">
                        {u.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <span className="au-name">{u.name}</span>
                        <span className="au-phone">{u.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role.toLowerCase().replace(/\s+/g,"-")}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.department}</td>
                  <td><span className="au-joined">{u.joinedOn}</span></td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={u.status === "Active"}
                        onChange={() => toggleStatus(u)}
                        disabled={u.status === "Exited"}
                      />
                      <span className="slider" />
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit"  onClick={() => openEdit(u)} title="Edit"><Edit2 size={15} /></button>
                      <button className="reset" onClick={() => resetPassword(u)} title="Reset Password"><RotateCcw size={15} /></button>
                      <button className="delete" disabled={u.status === "Exited"}
                        onClick={() => { setCurrentUser(u); setShowDelete(true); }} title="Deactivate">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={8} className="au-empty">No users found.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages} · {total} total</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && currentUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3><Edit2 size={16} /> Edit User</h3>
            <label>Full Name</label>
            <input value={editName}   onChange={e => setEditName(e.target.value)}   placeholder="Full Name" />
            <label>Email</label>
            <input value={editEmail}  onChange={e => setEditEmail(e.target.value)}  placeholder="Email" type="email" />
            <label>Phone</label>
            <input value={editPhone}  onChange={e => setEditPhone(e.target.value)}  placeholder="Phone" />
            <label>Role</label>
            <select value={editRoleId ?? ""} onChange={e => setEditRoleId(Number(e.target.value))}>
              <option value="">— Select Role —</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="primary" onClick={submitEdit} disabled={actionLoad}>
                {actionLoad ? <Loader2 size={14} className="spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && currentUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3><Trash2 size={16} /> Deactivate User</h3>
            <p>Are you sure you want to deactivate <strong>{currentUser.name}</strong>?
               Their account will be set to <strong>Exited</strong> and they will lose access.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="danger" onClick={submitDelete} disabled={actionLoad}>
                {actionLoad ? <Loader2 size={14} className="spin" /> : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInvite && (
        <div className="modal-overlay">
          <div className="modal modal-wide">
            <h3><Plus size={16} /> Invite New User</h3>
            <div className="modal-grid">
              <div>
                <label>Full Name *</label>
                <input value={invName}  onChange={e => setInvName(e.target.value)}  placeholder="Full Name" />
              </div>
              <div>
                <label>Email Address *</label>
                <input value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="Email" type="email" />
              </div>
              <div>
                <label>Phone</label>
                <input value={invPhone} onChange={e => setInvPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
              </div>
              <div>
                <label>Department</label>
                <input value={invDept}  onChange={e => setInvDept(e.target.value)}  placeholder="Department" />
              </div>
              <div className="modal-full">
                <label>Role *</label>
                <select value={invRoleId ?? ""} onChange={e => setInvRoleId(Number(e.target.value))}>
                  <option value="">— Select Role —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <p className="modal-note">
              A temporary password will be generated and sent to the email address provided.
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowInvite(false)}>Cancel</button>
              <button className="primary" onClick={submitInvite} disabled={actionLoad}>
                {actionLoad ? <Loader2 size={14} className="spin" /> : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}