"use client";

import "@/styles/hr-audit-logs.css";
import { Eye, Clock, User, FileText, Filter, Download, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface AuditLog {
  id: number;
  action_type: string;
  altered_by: number;
  altered_by_role: string;
  altered_by_name: string;
  target_user_name: string;
  target_department_name: string;
  old_value: string;
  new_value: string;
  action_date: string;
  notes: string;
}

const ADMIN_API = "http://localhost/etms/controllers/admin";

const ACTION_TYPE_LABELS: Record<string, string> = {
  'supervisor_assigned': '👤 Supervisor Assigned',
  'supervisor_removed': '❌ Supervisor Removed',
  'manager_assigned': '👨‍💼 Manager Assigned',
  'manager_removed': '❌ Manager Removed',
  'department_created': '✨ Department Created',
  'department_updated': '✏️ Department Updated',
  'department_deleted': '🗑️ Department Deleted',
};

export default function HRAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const itemsPerPage = 50;

  const fetchAuditLogs = useCallback(async (selectedPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const offset = (selectedPage - 1) * itemsPerPage;
      let url = `${ADMIN_API}/organization-audit-logs.php?limit=${itemsPerPage}&offset=${offset}`;
      if (filterType) {
        url += `&action_type=${filterType}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();

      if (json.success) {
        setLogs(json.logs || []);
        setTotalLogs(json.total || 0);
      } else {
        setError(json.error || "Failed to load audit logs");
      }
    } catch {
      setError("Unable to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchAuditLogs(page);
  }, [fetchAuditLogs, page]);

  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter);
    setPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Action', 'Modified By', 'Role', 'Target User', 'Department', 'Old Value', 'New Value', 'Notes'];
    const rows = logs.map(log => [
      new Date(log.action_date).toLocaleString(),
      ACTION_TYPE_LABELS[log.action_type] || log.action_type,
      log.altered_by_name,
      log.altered_by_role,
      log.target_user_name || '-',
      log.target_department_name || '-',
      log.old_value || '-',
      log.new_value || '-',
      log.notes || '-'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  return (
    <div className="hr-audit-logs-container">
      {/* HEADER */}
      <div className="hr-audit-header">
        <div>
          <h1><FileText size={28} /> Organization Audit Logs</h1>
          <p>Track all changes to supervisors, managers, and departments</p>
        </div>
        <button className="btn-export" onClick={handleExportCSV} title="Export to CSV">
          <Download size={18} /> Export
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <Filter size={18} />
        <button
          className={`filter-btn ${filterType === '' ? 'active' : ''}`}
          onClick={() => handleFilterChange('')}
        >
          All Actions
        </button>
        <button
          className={`filter-btn ${filterType === 'supervisor_assigned' ? 'active' : ''}`}
          onClick={() => handleFilterChange('supervisor_assigned')}
        >
          Supervisor Assigned
        </button>
        <button
          className={`filter-btn ${filterType === 'supervisor_removed' ? 'active' : ''}`}
          onClick={() => handleFilterChange('supervisor_removed')}
        >
          Supervisor Removed
        </button>
        <button
          className={`filter-btn ${filterType === 'manager_assigned' ? 'active' : ''}`}
          onClick={() => handleFilterChange('manager_assigned')}
        >
          Manager Assigned
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <p>{error}</p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-container">
          <Loader2 size={24} className="spin" />
          <p>Loading audit logs...</p>
        </div>
      )}

      {/* AUDIT LOGS TABLE */}
      {!loading && logs.length > 0 && (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Action</th>
                  <th>Modified By</th>
                  <th>Target</th>
                  <th>Change Details</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <td className="date-cell">
                      <Clock size={14} />
                      <span>{new Date(log.action_date).toLocaleString()}</span>
                    </td>
                    <td className="action-cell">
                      <span className={`action-badge action-${log.action_type}`}>
                        {ACTION_TYPE_LABELS[log.action_type] || log.action_type}
                      </span>
                    </td>
                    <td className="user-cell">
                      <div>
                        <span className="user-name">{log.altered_by_name}</span>
                        <span className="role-badge">{log.altered_by_role}</span>
                      </div>
                    </td>
                    <td className="target-cell">
                      <div>
                        {log.target_user_name && <span className="target-name">{log.target_user_name}</span>}
                        {log.target_department_name && <span className="target-dept">{log.target_department_name}</span>}
                      </div>
                    </td>
                    <td className="change-cell">
                      <div className="change-details">
                        {log.old_value && (
                          <>
                            <span className="old-value">{log.old_value}</span>
                            <span className="arrow">→</span>
                            <span className="new-value">{log.new_value}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="notes-cell">
                      {log.notes ? <span title={log.notes}>{log.notes.substring(0, 30)}...</span> : '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-page"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages} ({totalLogs} total)
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-page"
            >
              Next
            </button>
          </div>
        </>
      )}

      {!loading && logs.length === 0 && (
        <div className="empty-state">
          <Eye size={48} />
          <h2>No audit logs found</h2>
          <p>{filterType ? 'No logs match the selected filter' : 'No organization changes have been made yet'}</p>
        </div>
      )}
    </div>
  );
}
