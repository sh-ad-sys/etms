"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";
import "@/styles/staff-attendance.css";

interface StaffMember {
  id: number;
  full_name: string;
  email: string;
  department: string;
  check_in_time: string | null;
  check_out_time: string | null;
  attendance_status: string;
}

export default function StaffAttendancePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check user role and redirect if not supervisor
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role?.toLowerCase() !== "supervisor") {
          router.push("/dashboard");
          return;
        }
      } catch (e) {
        router.push("/dashboard");
        return;
      }
    }

    fetchStaffAttendance();
  }, [router]);

  const fetchStaffAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/admin/get-staff-attendance.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch staff attendance");
      }

      const json = await response.json();
      if (json.success) {
        setStaff(json.staff || []);
      } else {
        setError(json.error || "Failed to load staff attendance");
      }
    } catch (err: any) {
      setError(err.message || "Unable to load staff attendance");
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
    <div className="staff-attendance-container">
      {/* HEADER */}
      <div className="staff-attendance-header">
        <div>
          <h1>
            <Users size={28} /> Staff Attendance
          </h1>
          <p>View all staff members present today in your department</p>
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
          <p>Loading staff attendance...</p>
        </div>
      )}

      {/* STAFF LIST */}
      {!loading && (
        <div className="staff-attendance-table">
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
              {staff.length > 0 ? (
                staff.map((member, idx) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="name-cell">
                      <span className="avatar">{member.full_name.charAt(0)}</span>
                      {member.full_name}
                    </td>
                    <td>{member.email}</td>
                    <td>{member.department}</td>
                    <td>{formatTime(member.check_in_time)}</td>
                    <td>{formatTime(member.check_out_time)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(member.attendance_status)}`}>
                        {member.attendance_status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No staff attendance data available
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
