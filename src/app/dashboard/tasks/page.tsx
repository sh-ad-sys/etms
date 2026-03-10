"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

import "@/styles/tasks.css";

/* ================= TYPES ================= */

type TaskStatus = "pending" | "completed";

type TaskFromAPI = {
  id: number;
  title: string;
  description: string;
  completed: number;
  created_at: string;
  assigned_by: number;
};

type APIResponse = {
  success: boolean;
  tasks: TaskFromAPI[];
  error?: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  assigned_by: number;
};

/* ================= COMPONENT ================= */

export default function TasksPage() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH TASKS ================= */

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(
  "http://localhost/etms/controllers/get-tasks.php",
  {
    credentials: "include",   // ⭐ VERY IMPORTANT
    method: "GET"
  }
);

      const data: APIResponse = await res.json();

      if (!data.success) {
        console.error(data.error);
        return;
      }

      const formatted: Task[] = data.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.completed === 1 ? "completed" : "pending",
        created_at: task.created_at,
        assigned_by: task.assigned_by,
      }));

      setTasks(formatted);

    } catch (err) {
      console.error("Task fetch error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, []);

  useEffect(() => {
    fetchTasks();

    /* Auto refresh every 45 seconds */
    const interval = setInterval(fetchTasks, 45000);

    return () => clearInterval(interval);

  }, [fetchTasks]);

  /* ================= UPDATE TASK ================= */

  const updateStatus = async (id: number, status: TaskStatus) => {

    try {

      const completedValue = status === "completed" ? 1 : 0;

      const res = await fetch(
        "http://localhost/etms/controllers/update-task.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id,
            completed: completedValue,
          }),
        }
      );

      const result = await res.json();

      if (result.success) {

        /* Refresh tasks after update */
        setRefreshing(true);
        await fetchTasks();

        /* Log task action */
        await fetch(
          "http://localhost/etms/controllers/logs.php",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "TASK_STATUS_UPDATED",
              task_id: id,
            }),
          }
        );

      }

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTER ================= */

  const filteredTasks = tasks.filter((task) => {

    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || task.status === filter;

    return matchesSearch && matchesFilter;
  });

  /* ================= UI ================= */

  return (
    <div className="tasks-page">

      <div className="tasks-header">
        <h1>
          <ClipboardList size={22} style={{ marginRight: 8 }} />
          Enterprise Task Center
        </h1>

        <button
          className="refresh-btn"
          onClick={() => {
            setRefreshing(true);
            fetchTasks();
          }}
        >
          <RefreshCw size={16} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* SEARCH + FILTER */}
      <div className="tasks-toolbar">

        <div className="tasks-search">
          <Search size={18} />
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tasks-filters">
          {(["all", "pending", "completed"] as const).map((item) => (
            <button
              key={item}
              className={`filter-btn ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

      </div>

      {/* LOADING */}
      {loading && <div className="tasks-empty">Loading tasks...</div>}

      {/* TASK LIST */}
      {!loading && (
        <div className="tasks-grid">

          {filteredTasks.map((task) => (

            <div key={task.id} className="task-card">

              <div className="task-header">
                <h3>{task.title}</h3>
              </div>

              <p className="task-desc">
                {task.description}
              </p>

              <div className="task-meta">
                <Calendar size={14} />
                <span>
                  {new Date(task.created_at).toLocaleString()}
                </span>
              </div>

              <div className="task-status">
                {task.status === "pending" ? (
                  <span className="status pending">
                    <Clock size={14} /> Pending
                  </span>
                ) : (
                  <span className="status completed">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>

              <div className="task-actions">
                <button onClick={() => updateStatus(task.id, "pending")}>
                  Pending
                </button>

                <button onClick={() => updateStatus(task.id, "completed")}>
                  Complete
                </button>
              </div>

            </div>

          ))}

        </div>
      )}

      {!loading && filteredTasks.length === 0 && (
        <div className="tasks-empty">
          No tasks found.
        </div>
      )}

    </div>
  );
}