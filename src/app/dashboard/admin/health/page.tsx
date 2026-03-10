"use client";

import "@/styles/admin-health.css";
import { Server, Database, Activity, ShieldCheck, Cpu, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminHealthPage() {
  return (
    <div className="admin-health-container">

      {/* ================= HEADER ================= */}
      <div className="admin-health-header">
        <h1>System Health & Monitoring</h1>
        <p>Real-time monitoring of Royal Mabati Factory Employee Management System</p>
      </div>

      {/* ================= STATUS OVERVIEW ================= */}
      <div className="health-overview">

        <HealthCard 
          icon={<Server size={26} />}
          title="Server Status"
          value="Operational"
          status="good"
        />

        <HealthCard 
          icon={<Database size={26} />}
          title="Database"
          value="Connected"
          status="good"
        />

        <HealthCard 
          icon={<ShieldCheck size={26} />}
          title="Security"
          value="Protected"
          status="good"
        />

        <HealthCard 
          icon={<Activity size={26} />}
          title="System Uptime"
          value="99.98%"
          status="good"
        />

      </div>

      {/* ================= RESOURCE MONITOR ================= */}
      <div className="resource-section">

        <div className="resource-card">
          <div className="resource-header">
            <Cpu size={22} />
            <h3>CPU Usage</h3>
          </div>
          <ProgressBar value={45} />
          <span>45% Used</span>
        </div>

        <div className="resource-card">
          <div className="resource-header">
            <HardDrive size={22} />
            <h3>Storage Usage</h3>
          </div>
          <ProgressBar value={62} />
          <span>62% Used</span>
        </div>

      </div>

      {/* ================= SERVICES ================= */}
      <div className="services-section">
        <h2>System Services</h2>

        <ServiceItem name="Authentication Service" status="running" />
        <ServiceItem name="Attendance Module" status="running" />
        <ServiceItem name="Email Notification Service" status="running" />
        <ServiceItem name="Backup Service" status="running" />
      </div>

      {/* ================= LOGS ================= */}
      <div className="logs-section">
        <h2>Recent System Logs</h2>
        <div className="log-box">
          <p>[INFO] Server started successfully.</p>
          <p>[INFO] Database connected.</p>
          <p>[SUCCESS] Daily backup completed.</p>
        </div>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function HealthCard({ icon, title, value, status }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`health-card ${status}`}
    >
      <div className="health-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </motion.div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ServiceItem({ name, status }) {
  return (
    <div className="service-item">
      <span>{name}</span>
      <span className={`service-status ${status}`}>
        {status}
      </span>
    </div>
  );
}