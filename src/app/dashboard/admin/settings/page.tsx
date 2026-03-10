"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Server,
  Save,
  AlertTriangle
} from "lucide-react";
import "@/styles/admin-settings.css";

export default function AdminSettingsPage() {
  const [active, setActive] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <div className="system-settings-wrapper">
      
      <div className="settings-header">
        <h1>System Configuration</h1>
        <p>Royal Mabati Factory • Enterprise Management System</p>
      </div>

      <div className="settings-layout">

        {/* LEFT NAVIGATION */}
        <div className="settings-sidebar">
          <button className={active==="general"?"active":""}
            onClick={()=>setActive("general")}>
            <Settings size={16}/> General
          </button>

          <button className={active==="security"?"active":""}
            onClick={()=>setActive("security")}>
            <Shield size={16}/> Security
          </button>

          <button className={active==="notifications"?"active":""}
            onClick={()=>setActive("notifications")}>
            <Bell size={16}/> Notifications
          </button>

          <button className={active==="system"?"active":""}
            onClick={()=>setActive("system")}>
            <Server size={16}/> System
          </button>

          <button className={active==="database"?"active":""}
            onClick={()=>setActive("database")}>
            <Database size={16}/> Database
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="settings-content">

          {active === "general" && (
            <section>
              <h2>General Configuration</h2>
              <p className="section-desc">
                Configure organization-wide system preferences.
              </p>

              <div className="form-group">
                <label>Organization Name</label>
                <input defaultValue="Royal Mabati Factory"
                  onChange={()=>setHasChanges(true)} />
              </div>

              <div className="form-group">
                <label>System Timezone</label>
                <select onChange={()=>setHasChanges(true)}>
                  <option>Africa/Nairobi</option>
                  <option>UTC</option>
                </select>
              </div>
            </section>
          )}

          {active === "security" && (
            <section>
              <h2>Security Policies</h2>
              <p className="section-desc">
                Manage authentication, password policies, and access controls.
              </p>

              <div className="toggle-row">
                <div>
                  <strong>Enable Two-Factor Authentication</strong>
                  <span>Require OTP for all administrators</span>
                </div>
                <label className="switch">
                  <input type="checkbox"
                    onChange={()=>setHasChanges(true)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label>Password Minimum Length</label>
                <input type="number" defaultValue={8}
                  onChange={()=>setHasChanges(true)} />
              </div>

              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <input type="number" defaultValue={30}
                  onChange={()=>setHasChanges(true)} />
              </div>
            </section>
          )}

          {active === "system" && (
            <section>
              <h2>System Controls</h2>
              <p className="section-desc">
                Control application availability and maintenance.
              </p>

              <div className="toggle-row">
                <div>
                  <strong>Maintenance Mode</strong>
                  <span>Temporarily disable user access</span>
                </div>
                <label className="switch">
                  <input type="checkbox"
                    onChange={()=>setHasChanges(true)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <strong>Enable Audit Logs</strong>
                  <span>Track system activity & changes</span>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked
                    onChange={()=>setHasChanges(true)} />
                  <span className="slider"></span>
                </label>
              </div>
            </section>
          )}

          {active === "database" && (
            <section>
              <h2>Database Management</h2>
              <p className="section-desc">
                Backup, restore, and manage system data.
              </p>

              <div className="button-row">
                <button className="secondary-btn">
                  Create Backup
                </button>

                <button className="secondary-btn">
                  Restore Backup
                </button>
              </div>

              <div className="danger-zone">
                <AlertTriangle size={16}/>
                <div>
                  <h4>Danger Zone</h4>
                  <p>Reset or permanently delete system data.</p>
                </div>
                <button className="danger-btn">
                  Reset System
                </button>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* STICKY SAVE BAR */}
      {hasChanges && (
        <div className="sticky-save">
          <span>You have unsaved changes</span>
          <button onClick={()=>setHasChanges(false)}>
            <Save size={16}/> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}