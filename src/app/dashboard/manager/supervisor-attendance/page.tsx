"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";
import "@/styles/supervisor-attendance.css";

interface SupervisorAttendance {
  id: number;
  full_name: string;
  email: string;
  department: string;
  check_in_time: string | null;
  check_out_time: string | null;
  attendance_status: string;
}

export default function SupervisorAttendancePage() {
  const router = useRouter();
  const [supervisors, setSupervisors] = useState<SupervisorAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check user role and redirect if not manager
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role?.toLowerCase() !== "manager") {
          router.push("/dashboard");
          return;
        }
      } catch (e) {
        router.push("/dashboard");
        return;
      }
    }

    fetchSupervisorAttendance();
  }, [router]);

  const fetchSupervisorAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/admin/get-supervisor-attendance.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch supervisor attendance");
      }

      const json = await response.json();
      if (json.success) {
        setSupervisors(json.supervisors || []);
      } else {
        setError(json.error || "Failed to load supervisor attendance");
      }
    } catch (err: any) {
      setError(err.message || "Unable to load supervisor attendance");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not checked in";
    try {
      const date = new Date(time);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "present":
      case "checked_in":
        return "status-present";
      case "absent":
        return "status-absent";
      case "late":
        return "status-late";
      default:
        return "status-unknown";
    }
  };

  return (
    <div className="supervisor-attendance-container">
      {/* HEADER */}
      <div className="supervisor-attendance-header">
        <div>
          <h1>
            <Users size={28} /> Supervisor Attendance
          </h1>
          <p>View all supervisors' attendance in your departments</p>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-container">
          <Loader2 size={24} className="spin" />
          <p>Loading supervisor attendance...</p>
        </div>
      )}

      {/* SUPERVISORS LIST */}
      {!loading && (
        <div className="supervisor-attendance-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.length > 0 ? (
                supervisors.map((supervisor, idx) => (
                  <motion.tr
                    key={supervisor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="name-cell">
                      <span className="avatar">{supervisor.full_name.charAt(0)}</span>
                      {supervisor.full_name}
                    </td>
                    <td>{supervisor.email}</td>
                    <td>{supervisor.department}</td>
                    <td>{formatTime(supervisor.check_in_time)}</td>
                    <td>{formatTime(supervisor.check_out_time)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(supervisor.attendance_status)}`}>
                        {supervisor.attendance_status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No supervisor attendance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
