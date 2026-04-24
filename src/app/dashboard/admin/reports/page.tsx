"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Download, Calendar, Loader2, AlertTriangle, X, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import "@/styles/admin-reports.css";
import API_BASE_URL from "@/config/api";
import { apiGet } from "@/lib/api-client";

interface AttendanceReport {
  date: string;
  total_staff: number;
  present: number;
  absent: number;
  late: number;
  attendance_rate: number;
}

interface ReportData {
  summary: {
    period: string;
    total_records: number;
    avg_attendance_rate: number;
    total_staff: number;
  };
  daily_data: AttendanceReport[];
}

type ReportPeriod = "daily" | "weekly" | "monthly";

interface ReportResponse {
  report: ReportData;
}

export default function AttendanceReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodType, setPeriodType] = useState<ReportPeriod>("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        period: periodType,
        date: selectedDate,
      });
      const json = await apiGet<ReportResponse>(`/admin/generate-attendance-report.php?${params.toString()}`);
      if (json.success) {
        setReportData(json.report);
      } else {
        setError(json.error || "Failed to load report");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load report");
    } finally {
      setLoading(false);
    }
  }, [periodType, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportToCSV = async () => {
    if (!reportData) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({
        period: periodType,
        date: selectedDate,
        format: "csv",
      });
      const response = await fetch(
        `${API_BASE_URL}/admin/export-attendance-report.php?${params.toString()}`,
        {
          headers: {
            Authorization: typeof window === "undefined" ? "" : `Bearer ${localStorage.getItem("token") || ""}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `attendance-report-${periodType}-${selectedDate}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1>
            <BarChart3 size={28} /> Attendance Reports
          </h1>
          <p>View and export daily, weekly, and monthly attendance analytics</p>
        </div>
      </div>

      {error && (
        <motion.div className="alert alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </motion.div>
      )}

      <div className="reports-filters">
        <div className="filter-group">
          <label>Report Period</label>
          <select
            value={periodType}
            onChange={(event) => setPeriodType(event.target.value as ReportPeriod)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{periodType === "daily" ? "Date" : "Start Date"}</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>

        <div className="filter-actions">
          <button onClick={exportToCSV} disabled={exporting || !reportData} className="btn-export csv">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <Loader2 size={24} className="spin" />
          <p>Generating report...</p>
        </div>
      )}

      {!loading && reportData && (
        <div className="reports-content">
          <div className="summary-cards">
            <motion.div className="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="card-icon">
                <Calendar size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Period</span>
                <span className="card-value">{reportData.summary.period}</span>
              </div>
            </motion.div>

            <motion.div className="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Avg Attendance Rate</span>
                <span className="card-value">{reportData.summary.avg_attendance_rate.toFixed(1)}%</span>
              </div>
            </motion.div>

            <motion.div className="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="card-icon">
                <BarChart3 size={24} />
              </div>
              <div className="card-content">
                <span className="card-label">Total Staff</span>
                <span className="card-value">{reportData.summary.total_staff}</span>
              </div>
            </motion.div>
          </div>

          <div className="reports-table">
            <h2>Detailed Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Staff</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.daily_data.map((day, idx) => (
                  <motion.tr
                    key={day.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <td className="date-cell">{day.date}</td>
                    <td>{day.total_staff}</td>
                    <td className="present-cell">{day.present}</td>
                    <td className="absent-cell">{day.absent}</td>
                    <td className="late-cell">{day.late}</td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${day.attendance_rate}%` }} />
                        <span className="progress-text">{day.attendance_rate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
