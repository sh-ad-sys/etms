"use client";

import "@/styles/admin-devices.css";
import {
  Monitor,
  Smartphone,
  Shield,
  Plus,
  Ban,
  CheckCircle,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDevicesPage() {

  const [devices, setDevices] = useState([
    {
      name: "Admin Office PC",
      type: "Desktop",
      ip: "192.168.1.10",
      lastActive: "2 mins ago",
      status: "approved",
    },
    {
      name: "HR Tablet",
      type: "Tablet",
      ip: "192.168.1.22",
      lastActive: "10 mins ago",
      status: "pending",
    },
    {
      name: "Biometric Scanner - Gate A",
      type: "Biometric",
      ip: "192.168.1.30",
      lastActive: "Online",
      status: "approved",
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const [newDevice, setNewDevice] = useState({
    name: "",
    type: "Desktop",
    ip: "",
  });

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ip) return;

    setDevices([
      ...devices,
      {
        ...newDevice,
        lastActive: "Just Added",
        status: "pending",
      },
    ]);

    setNewDevice({ name: "", type: "Desktop", ip: "" });
    setShowModal(false);
  };

  return (
    <div className="admin-devices-container">

      {/* HEADER */}
      <div className="admin-devices-header">
        <h1>Device Restrictions & Access Control</h1>
        <p>Manage approved devices, IP restrictions and secure system access</p>
      </div>

      {/* ACTION BAR */}
      <div className="devices-action-bar">
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Register New Device
        </button>
      </div>

      {/* DEVICE TABLE */}
      <div className="devices-table-card">
        <h2>Registered Devices</h2>

        <table className="devices-table">
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Type</th>
              <th>IP Address</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device, index) => (
              <tr key={index}>
                <td className="device-name-cell">
                  {getIcon(device.type)}
                  {device.name}
                </td>
                <td>{device.type}</td>
                <td>{device.ip}</td>
                <td>{device.lastActive}</td>
                <td>
                  <span className={`status-badge ${device.status}`}>
                    {device.status}
                  </span>
                </td>
                <td className="action-buttons">
                  {device.status === "pending" && (
                    <button
                      className="approve-btn"
                      onClick={() => {
                        const updated = [...devices];
                        updated[index].status = "approved";
                        setDevices(updated);
                      }}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    className="block-btn"
                    onClick={() => {
                      const updated = [...devices];
                      updated[index].status = "blocked";
                      setDevices(updated);
                    }}
                  >
                    <Ban size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD DEVICE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="modal-header">
                <h2>Register New Device</h2>
                <X size={20} onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <input
                  type="text"
                  placeholder="Device Name"
                  value={newDevice.name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, name: e.target.value })
                  }
                />

                <select
                  value={newDevice.type}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, type: e.target.value })
                  }
                >
                  <option>Desktop</option>
                  <option>Tablet</option>
                  <option>Biometric</option>
                </select>

                <input
                  type="text"
                  placeholder="IP Address"
                  value={newDevice.ip}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, ip: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleAddDevice}>
                  Add Device
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* COMPONENTS */

function getIcon(type: string) {
  switch (type) {
    case "Desktop":
      return <Monitor size={16} />;
    case "Tablet":
      return <Smartphone size={16} />;
    case "Biometric":
      return <Shield size={16} />;
    default:
      return <Monitor size={16} />;
  }
}