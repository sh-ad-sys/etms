"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle, Search, CheckCircle, Eye,
  Loader2, RefreshCw, Calendar, X,
  AlertCircle, ChevronDown, ChevronUp, Clock,
} from "lucide-react";
import "@/styles/missing-checkins.css";

/* ─── Types ─────────────────────────────────────────────── */

type Status     = "Unresolved" | "Resolved";
type FilterType = "All" | Status;

type MissingCheckin = {
  id:           string;
  name:         string;
  employeeCode: string;
  department:   string;
  date:         string;
  expectedTime: string;
  status:       Status;
  note:         string;
  resolvedAt:   string | null;
  resolvedBy:   string | null;
};

type Summary = { total: number; unresolved: number; resolved: number };

const API = "http://localhost/etms/controllers/supervisor";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Component ─────────────────────────────────────────── */

export default function MissingCheckinsPage() {

  const [records,    setRecords]    = useState<MissingCheckin[]>([]);
  const [summary,    setSummary]    = useState<Summary>({ total: 0, unresolved: 0, resolved: 0 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<FilterType>("All");
  const [dateFrom,   setDateFrom]   = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dateTo,     setDateTo]     = useState(() => new Date().toISOString().split("T")[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* Resolve modal state */
  const [resolveTarget, setResolveTarget] = useState<MissingCheckin | null>(null);
  const [resolveNote,   setResolveNote]   = useState("");
  const [resolving,     setResolving]     = useState(false);

  /* ── Toast ── */
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch ── */
  const fetchRecords = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ status: filter, from: dateFrom, to: dateTo, search });
      const res    = await fetch(`${API}/get-missing-checkins.php?${params}`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired."); return; }
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        setSummary(data.summary);
      } else {
        setError(data.error || "Failed to load records.");
      }
    } catch {
      setError("Unable to connect.");
    } finally {
      setLoading(false);
    }
  }, [filter, dateFrom, dateTo, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  /* ── Resolve ── */
  const handleResolve = async () => {
    if (!resolveTarget) return;
    setResolving(true);
    try {
      const res  = await fetch(`${API}/resolve-missing.php`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ id: resolveTarget.id, note: resolveNote }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords(prev => prev.map(r =>
          r.id === resolveTarget.id
            ? { ...r, status: "Resolved", note: resolveNote, resolvedAt: data.resolvedAt }
            : r
        ));
        setSummary(s => ({ ...s, unresolved: s.unresolved - 1, resolved: s.resolved + 1 }));
        setResolveTarget(null);
        setResolveNote("");
        showToast("Marked as resolved.", "success");
      } else {
        showToast(data.error || "Failed to resolve.", "error");
      }
    } catch {
      showToast("Unable to connect.", "error");
    } finally {
      setResolving(false);
    }
  };

  /* ── Filtered ── */
  const filtered = useMemo(() =>
    records.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeCode.toLowerCase().includes(search.toLowerCase())
    ),
    [records, search]
  );

  /* ── Render ── */
  return (
    <div className="missing-page">

      {/* TOAST */}
      {toast && (
        <div className={`mc-toast mc-toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolveTarget && (
        <div className="mc-modal-overlay" onClick={() => setResolveTarget(null)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-header">
              <h3><CheckCircle size={18} /> Resolve Missing Check-in</h3>
              <button className="mc-modal-close" onClick={() => setResolveTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="mc-modal-body">
              <p className="mc-modal-info">
                <strong>{resolveTarget.name}</strong> · {resolveTarget.department} · {fmt(resolveTarget.date)}
              </p>
              <label>Resolution Note</label>
              <textarea
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
                placeholder="e.g. Staff was on approved leave, system error, emergency..."
                rows={4}
              />
            </div>
            <div className="mc-modal-footer">
              <button className="mc-btn-cancel" onClick={() => setResolveTarget(null)} disabled={resolving}>
                Cancel
              </button>
              <button className="mc-btn-resolve" onClick={handleResolve} disabled={resolving}>
                {resolving
                  ? <><Loader2 size={14} className="spin" /> Resolving...</>
                  : <><CheckCircle size={14} /> Mark Resolved</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="missing-header">
        <div>
          <h1><AlertTriangle size={22} /> Missing Check-ins</h1>
          <p>Dashboard / Supervisor / Missing Check-ins</p>
        </div>
        <button className="mc-refresh-btn" onClick={fetchRecords} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="missing-summary">
        <div className="summary-card total">
          <AlertTriangle size={20} />
          <div><h3>{summary.total}</h3><p>Total Records</p></div>
        </div>
        <div className="summary-card warning">
          <Clock size={20} />
          <div><h3>{summary.unresolved}</h3><p>Unresolved</p></div>
        </div>
        <div className="summary-card success">
          <CheckCircle size={20} />
          <div><h3>{summary.resolved}</h3><p>Resolved</p></div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="missing-controls">
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search staff, ID or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="date-box">
          <Calendar size={14} />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span>—</span>
          <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {(["All", "Unresolved", "Resolved"] as FilterType[]).map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""} tab-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && (
                <span className="tab-count">
                  {f === "Unresolved" ? summary.unresolved : summary.resolved}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="mc-error"><AlertCircle size={14} /> {error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="mc-loading"><Loader2 size={20} className="spin" /> Loading records...</div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="missing-table-wrapper">
          <table className="missing-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Department</th>
                <th>Date</th>
                <th>Expected</th>
                <th>Status</th>
                <th>Actions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => (
                <>
                  <tr
                    key={record.id}
                    className={`mc-row mc-row-${record.status.toLowerCase()}`}
                  >
                    <td>
                      <div className="staff-cell">
                        <span className="staff-name">{record.name}</span>
                        {record.employeeCode && (
                          <span className="staff-code">{record.employeeCode}</span>
                        )}
                      </div>
                    </td>
                    <td>{record.department}</td>
                    <td>{fmt(record.date)}</td>
                    <td><span className="expected-time">{record.expectedTime}</span></td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>
                        {record.status === "Resolved"
                          ? <><CheckCircle size={11} /> Resolved</>
                          : <><AlertTriangle size={11} /> Unresolved</>
                        }
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="view-btn"
                          onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                        >
                          <Eye size={13} /> View
                        </button>
                        {record.status === "Unresolved" && (
                          <button
                            className="resolve-btn"
                            onClick={() => { setResolveTarget(record); setResolveNote(""); }}
                          >
                            <CheckCircle size={13} /> Resolve
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="expand-btn"
                        onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                      >
                        {expandedId === record.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED ROW */}
                  {expandedId === record.id && (
                    <tr key={`${record.id}-detail`} className="mc-detail-row">
                      <td colSpan={7}>
                        <div className="mc-detail-panel">
                          {record.note ? (
                            <div className="mc-detail-item">
                              <span className="mc-detail-label">Resolution Note</span>
                              <p>{record.note}</p>
                            </div>
                          ) : (
                            <div className="mc-detail-item">
                              <span className="mc-detail-label">Note</span>
                              <p className="no-note">No note added yet.</p>
                            </div>
                          )}
                          {record.resolvedAt && (
                            <div className="mc-detail-item">
                              <span className="mc-detail-label">Resolved</span>
                              <p>{record.resolvedAt}{record.resolvedBy ? ` by ${record.resolvedBy}` : ""}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !error && (
            <div className="empty-state">No missing check-in records found.</div>
          )}
        </div>
      )}

    </div>
  );
}