"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  Calendar,
  Tag,
  Flag,
  User,
  Loader2,
  RefreshCw,
  Filter,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import "@/styles/checklist.css";

/* ─── Types ─────────────────────────────────────────────── */

type Priority   = "low" | "medium" | "high";
type TaskStatus = "pending" | "in_progress" | "completed";
type FilterType = "all" | TaskStatus;

type WorkTask = {
  id:             string;
  title:          string;
  description:    string;
  dueDate:        string | null;
  category:       string;
  priority:       Priority;
  completed:      boolean;
  status:         TaskStatus;
  completedAt:    string | null;
  supervisorName: string;
  assignedOn:     string;
};

const API = "http://localhost/etms/controllers";

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending:     "Pending",
  in_progress: "Overdue",
  completed:   "Completed",
};

/* ─── Component ──────────────────────────────────────────── */

export default function WorkerChecklistPage() {

  const [tasks,      setTasks]      = useState<WorkTask[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filter,     setFilter]     = useState<FilterType>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /* ── Fetch ── */

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/get-tasks.php`, { credentials: "include" });
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) setTasks(data.tasks || []);
      else setError(data.error || "Failed to load tasks.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  /* ── Toggle ── */

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted;
    setTogglingId(id);

    /* Optimistic */
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: newCompleted, status: newCompleted ? "completed" : "pending", completedAt: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );

    try {
      const res = await fetch(`${API}/update-task.php`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ id, completed: newCompleted }),
      });
      const data = await res.json();
      if (!data.success) { fetchTasks(); setError(data.error || "Failed to update task."); }
    } catch {
      fetchTasks();
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Stats ── */

  const stats = useMemo(() => {
    const total     = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending   = tasks.filter((t) => t.status === "pending").length;
    const overdue   = tasks.filter((t) => t.status === "in_progress").length;
    const pct       = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, pct };
  }, [tasks]);

  /* ── Filter ── */

  const filtered = useMemo(() =>
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter),
    [tasks, filter]
  );

  /* ── Due date colour ── */

  const dueDateClass = (dueDate: string | null, completed: boolean) => {
    if (completed || !dueDate) return "due-ok";
    const diff = (new Date(dueDate).getTime() - Date.now()) / 86400000;
    if (diff < 0)  return "due-overdue";
    if (diff <= 1) return "due-soon";
    return "due-ok";
  };

  /* ── Render ── */

  return (
    <div className="checklist-page">

      {/* HEADER */}
      <div className="checklist-header">
        <h1><ClipboardList size={22} style={{ marginRight: 8 }} />My Work Tasks</h1>
        <p>Dashboard / Tasks / My Checklist</p>
      </div>

      {/* PROGRESS */}
      <div className="checklist-progress-card">
        <div className="progress-info">
          <h3>Overall Progress</h3>
          <span>{stats.completed} / {stats.total} tasks · {stats.pct}% done</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        <div className="progress-badges">
          <span className="badge badge-pending"><Circle size={12} /> {stats.pending} Pending</span>
          {stats.overdue > 0 && (
            <span className="badge badge-overdue"><AlertCircle size={12} /> {stats.overdue} Overdue</span>
          )}
          <span className="badge badge-completed"><CheckCircle2 size={12} /> {stats.completed} Completed</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="checklist-toolbar">
        <div className="checklist-filter">
          <Filter size={15} />
          <select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in_progress">Overdue</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown size={14} />
        </div>
        <button className="refresh-btn" onClick={fetchTasks} disabled={loading} title="Refresh">
          <RefreshCw size={15} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="checklist-error">{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="checklist-loading">
          <Loader2 size={20} className="spin" /> Loading your tasks...
        </div>
      )}

      {/* TASK LIST */}
      {!loading && (
        <div className="checklist-grid">

          {filtered.map((task) => (
            <div
              key={task.id}
              className={`checklist-card ${
                task.completed        ? "card-completed"
                : task.status === "in_progress" ? "card-overdue"
                : "card-pending"
              }`}
            >

              {/* TICK */}
              <button
                className={`check-btn ${task.completed ? "check-done" : "check-undone"}`}
                onClick={() => toggleTask(task.id, task.completed)}
                disabled={togglingId === task.id}
                title={task.completed ? "Mark as pending" : "Mark as completed"}
              >
                {togglingId === task.id
                  ? <Loader2 size={22} className="spin" />
                  : task.completed
                    ? <CheckCircle2 size={22} />
                    : <Circle size={22} />
                }
              </button>

              {/* CONTENT */}
              <div className="checklist-content">
                <div className="task-title-row">
                  <h3 className="task-title">{task.title}</h3>
                  <span className={`priority priority-${task.priority}`}>
                    <Flag size={11} /> {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="checklist-meta">
                  {task.dueDate && (
                    <span className={`due-label ${dueDateClass(task.dueDate, task.completed)}`}>
                      <Calendar size={13} /> Due: {task.dueDate}
                    </span>
                  )}
                  <span><Tag size={13} /> {task.category}</span>
                  <span><User size={13} /> {task.supervisorName}</span>
                  <span><Clock size={13} /> Assigned: {task.assignedOn}</span>
                </div>
              </div>

              {/* STATUS */}
              <div className="task-status-col">
                <span className={`status-badge status-badge-${task.status}`}>
                  {STATUS_LABEL[task.status]}
                </span>
                {task.completedAt && (
                  <span className="completed-time">
                    ✓ {new Date(task.completedAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                )}
              </div>

            </div>
          ))}

          {filtered.length === 0 && (
            <div className="checklist-empty">
              {filter === "all"
                ? "No tasks have been assigned to you yet."
                : `No ${STATUS_LABEL[filter as TaskStatus]?.toLowerCase()} tasks.`}
            </div>
          )}

        </div>
      )}

    </div>
  );
}