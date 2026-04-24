"use client";

import "@/styles/admin-account-status.css";
import { useState, useEffect, useCallback } from "react";
import { Shield, Lock, Unlock, Search, UserX, AlertTriangle, Loader2 } from "lucide-react";

interface Account {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Suspended" | "Locked";
}

const API = "http://localhost/etms/controllers/admin";

export default function AccountStatusPage() {

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${API}/get-admin-users.php${query}`, {
        credentials: "include"
      });
      if (res.status === 401) {
        setError("Session expired.");
        return;
      }
      const json = await res.json();
      if (json.success && json.users) {
        setAccounts(json.users.map((u: any) => ({
          id: u.id,
          name: u.name || u.full_name,
          email: u.email,
          status: u.status === "Suspended" ? "Suspended" : u.status === "Locked" ? "Locked" : "Active"
        })));
      } else {
        setError(json.error || "Failed to load accounts.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (newStatus: "Suspended" | "Locked") => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`${API}/admin-users-actions.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: selectedUser.id,
          action: newStatus === "Locked" ? "lock" : "suspend"
        })
      });

      const json = await res.json();
      if (json.success) {
        setAccounts(prev =>
          prev.map(acc =>
            acc.id === selectedUser.id
              ? { ...acc, status: newStatus }
              : acc
          )
        );
        setShowModal(false);
      } else {
        alert(json.error || "Failed to update account status");
      }
    } catch {
      alert("Error updating account status");
    }
  };

  return (
    <div className="account-status-container">

      {/* HEADER */}
      <div className="account-header">
        <h1>
          <Shield size={28}/> Account Security Control
        </h1>
        <p>Manage user account lock and suspension policies</p>
      </div>

      {/* SEARCH */}
      <div className="account-controls">
        <div className="search-box">
          <Search size={18}/>
          <input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="account-error">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="account-loading">
          <Loader2 size={22} className="spin" /> Loading accounts...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
      <div className="account-card">

        <table className="account-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Security Actions</th>
            </tr>
          </thead>

          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4} className="account-empty">No accounts found</td>
              </tr>
            ) : (
              accounts.map(acc => (
                <tr key={acc.id}>
                  <td>{acc.name}</td>
                  <td>{acc.email}</td>

                  <td>
                    <span className={`status ${acc.status.toLowerCase()}`}>
                      {acc.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">

                      <button
                        className="lock-btn"
                        onClick={() => {
                          setSelectedUser(acc);
                          setShowModal(true);
                        }}
                      >
                        <Lock size={16}/>
                        Change Status
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
      )}

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>
              <AlertTriangle size={20}/> Modify Account Status
            </h3>

            <p>
              Select security action for <strong>{selectedUser.name}</strong>
            </p>

            <div className="modal-actions">

              <button
                className="suspend"
                onClick={() => toggleStatus("Suspended")}
              >
                <UserX size={16}/> Suspend Account
              </button>

              <button
                className="lock"
                onClick={() => toggleStatus("Locked")}
              >
                <Lock size={16}/> Lock Account
              </button>

              <button
                className="cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}