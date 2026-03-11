"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardPen, Plus, X, Search, Loader2, RefreshCw,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Trash2, Users, Calendar, Tag, Flag, AlarmClock,
  CheckSquare, Clock, SlidersHorizontal,
} from "lucide-react";
import "@/styles/task-assignment.css";

/* ─── Types ────────────────────────────────────────────── */

type Priority = "low" | "medium" | "high";

type Worker = {
  id:           number;
  full_name:    string;
  employeeCode: string;
  department:   string;
};

type Task = {
  id:           string;
  title:        string;
  description:  string;
  dueDate:      string | null;
  category:     string;
  priority:     Priority;
  completed:    boolean;
  completedAt:  string | null;
  createdAt:    string;
  workerId:     string;
  workerName:   string;
  employeeCode: string;
  isOverdue:    boolean;
};

type Summary = { total: number; done: number; pending: number; overdue: number };

type FormState = {
  title:       string;
  description: string;
  due_date:    string;
  category:    string;
  priority:    Priority;
  shift_note:  string;
  worker_ids:  number[];
};

const EMPTY_FORM: FormState = {
  title: "", description: "", due_date: "",
  category: "General", priority: "medium",
  shift_note: "", worker_ids: [],
};

const CATEGORIES = ["General", "Production", "Safety", "Maintenance", "Quality Control", "Logistics", "Cleaning"];
const PRIORITIES: Priority[] = ["low", "medium", "high"];
const API = "http://localhost/etms/controllers/supervisor";

const priorityMeta: Record<Priority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "prio-low"    },
  medium: { label: "Medium", color: "prio-medium" },
  high:   { label: "High",   color: "prio-high"   },
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Page ─────────────────────────────────────────────── */

export default function TaskAssignmentPage() {

  const [workers,     setWorkers]     = useState<Worker[]>([]);
  const [tasks,       setTasks]       = useState<Task[]>([]);
  const [summary,     setSummary]     = useState<Summary>({ total: 0, done: 0, pending: 0, overdue: 0 });
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState<FormState>(EMPTY_FORM);
  const [workerSearch,setWorkerSearch]= useState("");
  const [taskSearch,  setTaskSearch]  = useState("");
  const [filterPrio,  setFilterPrio]  = useState("all");
  const [filterDone,  setFilterDone]  = useState("all");
  const [expandedId,  setExpandedId]  = useState<string | null>(null);
  const [toast,       setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  /* ── Toast helper ── */
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch workers ── */
  const fetchWorkers = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/get-workers.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setWorkers(data.workers);
    } catch { /* silent */ }
  }, []);

  /* ── Fetch tasks ── */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        priority:  filterPrio,
        completed: filterDone,
        search:    taskSearch,
      });
      const res  = await fetch(`${API}/get-assigned-tasks.php?${params}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        setSummary(data.summary);
      } else {
        showToast(data.error || "Failed to load tasks.", "error");
      }
    } catch {
      showToast("Unable to connect.", "error");
    } finally {
      setLoading(false);
    }
  }, [filterPrio, filterDone, taskSearch]);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);
  useEffect(() => { fetchTasks();   }, [fetchTasks]);

  /* ── Worker selection ── */
  const toggleWorker = (id: number) => {
    setForm(f => ({
      ...f,
      worker_ids: f.worker_ids.includes(id)
        ? f.worker_ids.filter(w => w !== id)
        : [...f.worker_ids, id],
    }));
  };

  const selectAll = () => {
    const visible = filteredWorkers.map(w => w.id);
    setForm(f => ({
      ...f,
      worker_ids: visible.length === f.worker_ids.filter(id => visible.includes(id)).length
        ? f.worker_ids.filter(id => !visible.includes(id))
        : [...new Set([...f.worker_ids, ...visible])],
    }));
  };

  const filteredWorkers = useMemo(() =>
    workers.filter(w =>
      w.full_name.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.department.toLowerCase().includes(workerSearch.toLowerCase()) ||
      (w.employeeCode || "").toLowerCase().includes(workerSearch.toLowerCase())
    ), [workers, workerSearch]);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.title.trim()) { showToast("Task title is required.", "error"); return; }
    if (form.worker_ids.length === 0) { showToast("Select at least one worker.", "error"); return; }

    setSubmitting(true);
    console.log("Submitting task:", JSON.stringify(form));
    try {
      const res  = await fetch(`${API}/assign-tasks.php`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify(form),
      });
      console.log("Response status:", res.status, res.url);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { console.error("assign-tasks.php non-JSON response:", text); showToast("Server error. Check console.", "error"); setSubmitting(false); return; }
      if (data.success) {
        showToast(data.message, "success");
        setForm(EMPTY_FORM);
        setShowForm(false);
        fetchTasks();
      } else {
        showToast(data.error || "Failed to assign task.", "error");
      }
    } catch {
      showToast("Unable to connect.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    setDeletingId(id);
    try {
      const res  = await fetch(`${API}/delete-task.php`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        setSummary(s => ({ ...s, total: s.total - 1, pending: s.pending - 1 }));
        showToast("Task deleted.", "success");
      } else {
        showToast(data.error || "Failed to delete.", "error");
      }
    } catch {
      showToast("Unable to connect.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Render ── */
  return (
    <div className="ta-page">

      {/* TOAST */}
      {toast && (
        <div className={`ta-toast ta-toast-${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="ta-header">
        <div>
          <h1><ClipboardPen size={22} /> Task Assignment</h1>
          <p>Dashboard / Supervisor / Task Assignment</p>
        </div>
        <div className="ta-header-actions">
          <button className="ta-btn-refresh" onClick={fetchTasks} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
          <button className="ta-btn-new" onClick={() => setShowForm(v => !v)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Task"}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="ta-summary">
        <div className="ta-stat ta-stat-blue">
          <ClipboardPen size={18} />
          <div><h3>{summary.total}</h3><p>Total Tasks</p></div>
        </div>
        <div className="ta-stat ta-stat-green">
          <CheckSquare size={18} />
          <div><h3>{summary.done}</h3><p>Completed</p></div>
        </div>
        <div className="ta-stat ta-stat-amber">
          <Clock size={18} />
          <div><h3>{summary.pending}</h3><p>Pending</p></div>
        </div>
        <div className="ta-stat ta-stat-red">
          <AlarmClock size={18} />
          <div><h3>{summary.overdue}</h3><p>Overdue</p></div>
        </div>
      </div>

      {/* NEW TASK FORM */}
      {showForm && (
        <div className="ta-form-card">
          <h2><Plus size={16} /> Assign New Task</h2>

          <div className="ta-form-grid">

            {/* LEFT — task details */}
            <div className="ta-form-left">

              <div className="ta-field">
                <label>Task Title <span className="req">*</span></label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Inspect line 3 safety gear"
                />
              </div>

              <div className="ta-field">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detailed instructions for the worker..."
                  rows={3}
                />
              </div>

              <div className="ta-form-row">
                <div className="ta-field">
                  <label><Calendar size={13} /> Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  />
                </div>
                <div className="ta-field">
                  <label><Flag size={13} /> Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ta-form-row">
                <div className="ta-field">
                  <label><Tag size={13} /> Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="ta-field">
                  <label>Shift Note</label>
                  <input
                    value={form.shift_note}
                    onChange={e => setForm(f => ({ ...f, shift_note: e.target.value }))}
                    placeholder="e.g. Morning shift 06:00–14:00"
                  />
                </div>
              </div>

            </div>

            {/* RIGHT — worker selection */}
            <div className="ta-form-right">
              <div className="ta-workers-header">
                <label><Users size={13} /> Assign To <span className="req">*</span></label>
                <span className="ta-selected-count">
                  {form.worker_ids.length} selected
                </span>
              </div>

              <div className="ta-worker-search">
                <Search size={13} />
                <input
                  placeholder="Search workers..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                />
              </div>

              <button className="ta-select-all-btn" onClick={selectAll}>
                {filteredWorkers.every(w => form.worker_ids.includes(w.id))
                  ? "Deselect All" : "Select All Visible"}
              </button>

              <div className="ta-worker-list">
                {filteredWorkers.length === 0 ? (
                  <p className="ta-empty-workers">No workers found</p>
                ) : filteredWorkers.map(w => (
                  <label
                    key={w.id}
                    className={`ta-worker-item ${form.worker_ids.includes(w.id) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.worker_ids.includes(w.id)}
                      onChange={() => toggleWorker(w.id)}
                    />
                    <div className="ta-worker-info">
                      <span className="ta-worker-name">{w.full_name}</span>
                      <span className="ta-worker-meta">
                        {w.employeeCode && <span>{w.employeeCode}</span>}
                        <span>{w.department}</span>
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          <div className="ta-form-footer">
            <button className="ta-btn-cancel" onClick={() => { setForm(EMPTY_FORM); setShowForm(false); }}>
              Cancel
            </button>
            <button className="ta-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><Loader2 size={15} className="spin" /> Assigning...</>
                : <><CheckCircle2 size={15} /> Assign Task</>
              }
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="ta-filters">
        <div className="ta-filter-group">
          <SlidersHorizontal size={14} />
          <select value={filterPrio} onChange={e => setFilterPrio(e.target.value)}>
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="ta-filter-group">
          <select value={filterDone} onChange={e => setFilterDone(e.target.value)}>
            <option value="all">All Status</option>
            <option value="0">Pending</option>
            <option value="1">Completed</option>
          </select>
        </div>
        <div className="ta-search-box">
          <Search size={13} />
          <input
            placeholder="Search task or worker..."
            value={taskSearch}
            onChange={e => setTaskSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TASKS TABLE */}
      {loading ? (
        <div className="ta-loading"><Loader2 size={20} className="spin" /> Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="ta-empty">No tasks found. Assign one above.</div>
      ) : (
        <div className="ta-table-wrapper">
          <table className="ta-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Worker</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <>
                  <tr
                    key={task.id}
                    className={`ta-row ${task.completed ? "row-done" : ""} ${task.isOverdue ? "row-overdue" : ""}`}
                  >
                    <td>
                      <span className="ta-task-title">{task.title}</span>
                    </td>
                    <td>
                      <div className="ta-worker-cell">
                        <span className="ta-worker-dot" />
                        {task.workerName}
                        {task.employeeCode && (
                          <span className="ta-emp-code">{task.employeeCode}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`ta-prio-badge ${priorityMeta[task.priority].color}`}>
                        {priorityMeta[task.priority].label}
                      </span>
                    </td>
                    <td><span className="ta-category">{task.category}</span></td>
                    <td>
                      {task.dueDate ? (
                        <span className={task.isOverdue ? "ta-date-overdue" : "ta-date"}>
                          {fmt(task.dueDate)}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      {task.completed
                        ? <span className="ta-status-done"><CheckCircle2 size={13} /> Done</span>
                        : task.isOverdue
                          ? <span className="ta-status-overdue"><AlarmClock size={13} /> Overdue</span>
                          : <span className="ta-status-pending"><Clock size={13} /> Pending</span>
                      }
                    </td>
                    <td>
                      <div className="ta-row-actions">
                        <button
                          className="ta-expand-btn"
                          onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                        >
                          {expandedId === task.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        <button
                          className="ta-delete-btn"
                          onClick={() => handleDelete(task.id)}
                          disabled={deletingId === task.id}
                        >
                          {deletingId === task.id
                            ? <Loader2 size={14} className="spin" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === task.id && (
                    <tr key={`${task.id}-detail`} className="ta-detail-row">
                      <td colSpan={7}>
                        <div className="ta-detail-panel">
                          <div className="ta-detail-item">
                            <span className="ta-detail-label">Description</span>
                            <p>{task.description || "No description provided."}</p>
                          </div>
                          <div className="ta-detail-row-inline">
                            <div className="ta-detail-item">
                              <span className="ta-detail-label">Assigned On</span>
                              <p>{fmt(task.createdAt)}</p>
                            </div>
                            {task.completedAt && (
                              <div className="ta-detail-item">
                                <span className="ta-detail-label">Completed On</span>
                                <p>{fmt(task.completedAt)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}