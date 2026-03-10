"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Wrench,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Filter,
  ChevronDown,
  Loader2,
  TrendingUp,
  Star,
} from "lucide-react";

import "@/styles/feedback.css";

/* ─── Types ─────────────────────────────────────────────── */

type FeedbackStatus = "pending" | "reviewed" | "approved";
type FilterType     = "all" | FeedbackStatus;

type FactoryFeedback = {
  id:               string;
  task:             string;
  department:       string;
  supervisor:       string;
  performance:      number;
  safetyCompliance: number;
  qualityScore:     number;
  remarks:          string;
  date:             string;
  status:           FeedbackStatus;
};

type Averages = {
  performance:      number;
  safetyCompliance: number;
  qualityScore:     number;
};

const API = "http://localhost/etms/controllers/tasks";

/* ─── Star renderer ─────────────────────────────────────── */

function Stars({ score }: { score: number }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= score ? "star-filled" : "star-empty"}
        />
      ))}
      <span className="star-label">{score}/5</span>
    </span>
  );
}

/* ─── Component ─────────────────────────────────────────── */

export default function WorkerFeedbackPage() {

  const [feedbacks, setFeedbacks] = useState<FactoryFeedback[]>([]);
  const [averages,  setAverages]  = useState<Averages>({ performance: 0, safetyCompliance: 0, qualityScore: 0 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState<FilterType>("all");

  /* ── Fetch ── */

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/get-feedback.php`, {
        credentials: "include",
      });
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
        setAverages(data.averages  || { performance: 0, safetyCompliance: 0, qualityScore: 0 });
      } else {
        setError(data.error || "Failed to load feedback.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  /* ── Filtered list ── */

  const filtered = filter === "all"
    ? feedbacks
    : feedbacks.filter((f) => f.status === filter);

  /* ── Score colour ── */

  const scoreClass = (score: number) =>
    score >= 4 ? "score-high" : score === 3 ? "score-mid" : "score-low";

  /* ── Render ── */

  return (
    <div className="feedback-page">

      {/* HEADER */}
      <div className="feedback-header">
        <h1>
          <MessageSquare size={22} style={{ marginRight: 8 }} />
          Performance Feedback
        </h1>
        <p>Dashboard / Tasks / Performance Review</p>
      </div>

      {/* SUMMARY CARDS */}
      {!loading && !error && (
        <div className="feedback-summary">

          <div className="summary-card">
            <div className="summary-icon icon-blue">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <h3>Total Reviews</h3>
              <span>{feedbacks.length}</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon icon-yellow">
              <Wrench size={18} />
            </div>
            <div>
              <h3>Avg Performance</h3>
              <span>{averages.performance} / 5</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon icon-green">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3>Avg Safety</h3>
              <span>{averages.safetyCompliance} / 5</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon icon-purple">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3>Avg Quality</h3>
              <span>{averages.qualityScore} / 5</span>
            </div>
          </div>

        </div>
      )}

      {/* TOOLBAR */}
      <div className="feedback-toolbar">
        <div className="feedback-filter">
          <Filter size={15} />
          <select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
            <option value="all">All Feedback</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
          </select>
          <ChevronDown size={14} />
        </div>
        <button className="refresh-btn" onClick={fetchFeedback} disabled={loading} title="Refresh">
          <RefreshCw size={15} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* ERROR */}
      {error && <div className="feedback-error">{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className="feedback-loading">
          <Loader2 size={20} className="spin" /> Loading feedback...
        </div>
      )}

      {/* FEEDBACK LIST */}
      {!loading && (
        <div className="feedback-grid">

          {filtered.map((item) => (
            <div key={item.id} className={`feedback-card status-border-${item.status}`}>

              {/* TOP ROW */}
              <div className="feedback-top">
                <div className="feedback-task-info">
                  <h3>{item.task}</h3>
                  <p className="feedback-department">
                    {item.department} &nbsp;·&nbsp; Supervisor: <strong>{item.supervisor}</strong>
                  </p>
                </div>

                <span className={`status-badge status-${item.status}`}>
                  {item.status === "pending"  && <><Clock size={13} /> Pending</>}
                  {item.status === "reviewed" && <><ClipboardCheck size={13} /> Reviewed</>}
                  {item.status === "approved" && <><CheckCircle2 size={13} /> Approved</>}
                </span>
              </div>

              {/* METRICS */}
              <div className="metrics">

                <div className={`metric-item ${scoreClass(item.performance)}`}>
                  <Wrench size={15} />
                  <span>Performance</span>
                  <Stars score={item.performance} />
                </div>

                <div className={`metric-item ${scoreClass(item.safetyCompliance)}`}>
                  <ShieldCheck size={15} />
                  <span>Safety</span>
                  <Stars score={item.safetyCompliance} />
                </div>

                <div className={`metric-item ${scoreClass(item.qualityScore)}`}>
                  <TrendingUp size={15} />
                  <span>Quality</span>
                  <Stars score={item.qualityScore} />
                </div>

              </div>

              {/* REMARKS */}
              {item.remarks && (
                <div className="feedback-remarks">
                  <span className="remarks-label">Supervisor Remarks</span>
                  <p>{item.remarks}</p>
                </div>
              )}

              {/* DATE */}
              <div className="feedback-date">
                Evaluation Date: {new Date(item.date).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "long", year: "numeric"
                })}
              </div>

            </div>
          ))}

          {filtered.length === 0 && !error && (
            <div className="feedback-empty">
              {filter === "all"
                ? "No performance evaluations recorded yet."
                : `No ${filter} evaluations found.`}
            </div>
          )}

        </div>
      )}

    </div>
  );
}