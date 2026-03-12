"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings, Shield, Bell, Database,
  Server, Save, AlertTriangle, Loader2,
  CheckCircle2, RefreshCw,
} from "lucide-react";
import "@/styles/admin-settings.css";

/* ─── Types ─────────────────────────────────────────────── */

type SettingsMap = Record<string, string>;
type DbStats     = { sizeMB: number; tableCount: number; lastBackup: string };

const API = "http://localhost/etms/controllers/admin";

/* ─── Page ───────────────────────────────────────────────── */

export default function AdminSettingsPage() {

  const [active,      setActive]      = useState("general");
  const [settings,    setSettings]    = useState<SettingsMap>({});
  const [dbStats,     setDbStats]     = useState<DbStats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [hasChanges,  setHasChanges]  = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [resetInput,  setResetInput]  = useState("");
  const [showReset,   setShowReset]   = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Fetch settings ── */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin-settings.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setDbStats(data.dbStats);
      }
    } catch { showToast("Failed to load settings.", false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  /* ── Field change helper ── */
  const set = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: typeof value === "boolean" ? (value ? "1" : "0") : value }));
    setHasChanges(true);
  };
  const get  = (key: string, fallback = "")  => settings[key] ?? fallback;
  const bool = (key: string)                 => settings[key] === "1";

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API}/admin-settings.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_settings", ...settings }),
      });
      const data = await res.json();
      if (data.success) { showToast(data.message); setHasChanges(false); }
      else showToast(data.error || "Save failed.", false);
    } catch { showToast("Network error.", false); }
    finally { setSaving(false); }
  };

  /* ── DB action ── */
  const doDbAction = async (action: string, extra?: object) => {
    try {
      const res  = await fetch(`${API}/admin-settings.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (data.success) { showToast(data.message); fetchSettings(); }
      else showToast(data.error || "Action failed.", false);
    } catch { showToast("Network error.", false); }
  };

  if (loading) return (
    <div className="settings-loading"><Loader2 size={22} className="spin" /> Loading settings...</div>
  );

  const tabs = [
    { key: "general",       icon: <Settings      size={15} />, label: "General"       },
    { key: "security",      icon: <Shield        size={15} />, label: "Security"      },
    { key: "notifications", icon: <Bell          size={15} />, label: "Notifications" },
    { key: "system",        icon: <Server        size={15} />, label: "System"        },
    { key: "database",      icon: <Database      size={15} />, label: "Database"      },
  ];

  return (
    <div className="system-settings-wrapper">

      {/* TOAST */}
      {toast && (
        <div className={`settings-toast ${toast.ok ? "toast-ok" : "toast-err"}`}>
          {toast.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="settings-header">
        <div>
          <h1><Settings size={22} /> System Configuration</h1>
          <p>Royal Mabati Factory · Enterprise Management System</p>
        </div>
        <button className="settings-refresh-btn" onClick={fetchSettings}>
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="settings-layout">

        {/* SIDEBAR */}
        <div className="settings-sidebar">
          {tabs.map(t => (
            <button key={t.key}
              className={active === t.key ? "active" : ""}
              onClick={() => setActive(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="settings-content">

          {/* ── GENERAL ── */}
          {active === "general" && (
            <section>
              <h2>General Configuration</h2>
              <p className="section-desc">Configure organisation-wide system preferences.</p>

              <div className="form-group">
                <label>Organisation Name</label>
                <input value={get("org_name")} onChange={e => set("org_name", e.target.value)} />
              </div>

              <div className="form-group">
                <label>System Timezone</label>
                <select value={get("timezone", "Africa/Nairobi")} onChange={e => set("timezone", e.target.value)}>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                  <option value="UTC">UTC</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                </select>
              </div>
            </section>
          )}

          {/* ── SECURITY ── */}
          {active === "security" && (
            <section>
              <h2>Security Policies</h2>
              <p className="section-desc">Manage authentication, password policies, and access controls.</p>

              <div className="toggle-row">
                <div>
                  <strong>Enable Two-Factor Authentication</strong>
                  <span>Require OTP for all administrators</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("two_factor_auth")}
                    onChange={e => set("two_factor_auth", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>

              <div className="form-group">
                <label>Password Minimum Length</label>
                <input type="number" min={6} max={32}
                  value={get("password_min_length", "8")}
                  onChange={e => set("password_min_length", e.target.value)} />
              </div>

              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input type="number" min={5} max={1440}
                  value={get("session_timeout", "30")}
                  onChange={e => set("session_timeout", e.target.value)} />
              </div>
            </section>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === "notifications" && (
            <section>
              <h2>Notification Settings</h2>
              <p className="section-desc">Control how the system notifies users of events.</p>

              <div className="toggle-row">
                <div>
                  <strong>Email Notifications</strong>
                  <span>Send alerts and updates via email</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("notifications_email")}
                    onChange={e => set("notifications_email", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <strong>SMS Notifications</strong>
                  <span>Send alerts via SMS gateway</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("notifications_sms")}
                    onChange={e => set("notifications_sms", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <strong>Push Notifications</strong>
                  <span>In-app push alerts for all users</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("notifications_push")}
                    onChange={e => set("notifications_push", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
            </section>
          )}

          {/* ── SYSTEM ── */}
          {active === "system" && (
            <section>
              <h2>System Controls</h2>
              <p className="section-desc">Control application availability and maintenance.</p>

              <div className={`toggle-row ${bool("maintenance_mode") ? "toggle-row-danger" : ""}`}>
                <div>
                  <strong>Maintenance Mode</strong>
                  <span>Temporarily disable all user access to the system</span>
                  {bool("maintenance_mode") && (
                    <span className="settings-warning-tag">⚠ Currently active — users cannot log in</span>
                  )}
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("maintenance_mode")}
                    onChange={e => set("maintenance_mode", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <strong>Enable Audit Logs</strong>
                  <span>Track all system activity and changes</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("audit_logs_enabled")}
                    onChange={e => set("audit_logs_enabled", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
            </section>
          )}

          {/* ── DATABASE ── */}
          {active === "database" && (
            <section>
              <h2>Database Management</h2>
              <p className="section-desc">Backup, restore, and manage system data.</p>

              {/* DB Stats */}
              {dbStats && (
                <div className="db-stats-grid">
                  <div className="db-stat">
                    <span>Database Size</span>
                    <strong>{dbStats.sizeMB} MB</strong>
                  </div>
                  <div className="db-stat">
                    <span>Tables</span>
                    <strong>{dbStats.tableCount}</strong>
                  </div>
                  <div className="db-stat">
                    <span>Last Backup</span>
                    <strong>{dbStats.lastBackup}</strong>
                  </div>
                </div>
              )}

              <div className="toggle-row">
                <div>
                  <strong>Automatic Backups</strong>
                  <span>Schedule regular automated database backups</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={bool("db_auto_backup")}
                    onChange={e => set("db_auto_backup", e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>

              <div className="form-group">
                <label>Backup Frequency</label>
                <select value={get("backup_frequency", "daily")}
                  onChange={e => set("backup_frequency", e.target.value)}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="button-row">
                <button className="secondary-btn" onClick={() => doDbAction("db_backup")}>
                  <Database size={15} /> Create Backup Now
                </button>
              </div>

              {/* Danger Zone */}
              <div className="danger-zone">
                <div className="danger-zone-title">
                  <AlertTriangle size={16} />
                  <div>
                    <h4>Danger Zone</h4>
                    <p>Clears audit logs, resolved missing check-ins, and notification history. This cannot be undone.</p>
                  </div>
                </div>
                {showReset ? (
                  <div className="reset-confirm">
                    <input
                      placeholder='Type "RESET" to confirm'
                      value={resetInput}
                      onChange={e => setResetInput(e.target.value)}
                    />
                    <button className="danger-btn"
                      disabled={resetInput !== "RESET"}
                      onClick={() => { doDbAction("reset_system", { confirm: "RESET" }); setShowReset(false); setResetInput(""); }}>
                      Confirm Reset
                    </button>
                    <button className="secondary-btn" onClick={() => { setShowReset(false); setResetInput(""); }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="danger-btn" onClick={() => setShowReset(true)}>
                    Reset System Data
                  </button>
                )}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* STICKY SAVE BAR */}
      {hasChanges && (
        <div className="sticky-save">
          <span><AlertTriangle size={14} /> You have unsaved changes</span>
          <div className="sticky-save-actions">
            <button className="discard-btn" onClick={() => { fetchSettings(); setHasChanges(false); }}>
              Discard
            </button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="spin" /> Saving...</>
                : <><Save size={14} /> Save Changes</>
              }
            </button>
          </div>
        </div>
      )}

    </div>
  );
}