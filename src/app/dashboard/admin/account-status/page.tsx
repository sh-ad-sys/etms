"use client";

import "@/styles/admin-account-status.css";
import { useState } from "react";
import { Shield, Lock, Unlock, Search, UserX, AlertTriangle } from "lucide-react";

interface Account {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Suspended" | "Locked";
}

export default function AccountStatusPage() {

  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: "John Mwangi", email: "john@royalmabati.co.ke", status: "Active" },
    { id: 2, name: "Grace Achieng", email: "grace@royalmabati.co.ke", status: "Suspended" },
    { id: 3, name: "Peter Otieno", email: "peter@royalmabati.co.ke", status: "Active" }
  ]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (status: "Suspended" | "Locked") => {

    if (!selectedUser) return;

    setAccounts(prev =>
      prev.map(acc =>
        acc.id === selectedUser.id
          ? { ...acc, status }
          : acc
      )
    );

    setShowModal(false);
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

      {/* TABLE */}
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
            {filtered.map(acc => (
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
            ))}
          </tbody>
        </table>

      </div>

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