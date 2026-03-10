"use client";

import "@/styles/admin-qr-gps.css";
import { QrCode, MapPin, Shield, Clock, Save } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function QRAndGPSSettingsPage() {

  /* ================= STATE ================= */

  const [qrType, setQrType] = useState<"dynamic" | "static">("dynamic");
  const [qrExpiry, setQrExpiry] = useState(60);

  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [radius, setRadius] = useState(200);
  const [latitude, setLatitude] = useState(-1.2921);
  const [longitude, setLongitude] = useState(36.8219);

  const [antiSpoof, setAntiSpoof] = useState(true);

  const handleSave = () => {
    alert("QR & GPS Settings Saved Successfully");
  };

  return (
    <div className="qr-gps-container">

      {/* ================= HEADER ================= */}
      <div className="qr-gps-header">
        <h1>QR & GPS Attendance Settings</h1>
        <p>Configure secure attendance verification using QR code and GPS validation</p>
      </div>

      {/* ================= QR SETTINGS ================= */}
      <motion.div 
        className="settings-card"
        whileHover={{ scale: 1.01 }}
      >
        <div className="card-header">
          <QrCode size={22} />
          <h2>QR Code Configuration</h2>
        </div>

        <div className="form-grid">

          <div className="form-item">
            <label>QR Mode</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={qrType === "dynamic"}
                  onChange={() => setQrType("dynamic")}
                />
                Dynamic QR (Recommended)
              </label>

              <label>
                <input
                  type="radio"
                  checked={qrType === "static"}
                  onChange={() => setQrType("static")}
                />
                Static QR
              </label>
            </div>
          </div>

          <div className="form-item">
            <label>QR Expiry Time (Seconds)</label>
            <input
              type="number"
              value={qrExpiry}
              min={10}
              onChange={(e) =>
                setQrExpiry(Math.max(10, Number(e.target.value)))
              }
            />
          </div>

        </div>
      </motion.div>

      {/* ================= GPS SETTINGS ================= */}
      <motion.div 
        className="settings-card"
        whileHover={{ scale: 1.01 }}
      >
        <div className="card-header">
          <MapPin size={22} />
          <h2>GPS Location Validation</h2>
        </div>

        <div className="form-grid">

          <div className="form-item toggle">
            <label>Enable GPS Verification</label>
            <input
              type="checkbox"
              checked={gpsEnabled}
              onChange={() => setGpsEnabled(!gpsEnabled)}
            />
          </div>

          <div className="form-item">
            <label>Allowed Radius (Meters)</label>
            <input
              type="number"
              value={radius}
              min={50}
              onChange={(e) =>
                setRadius(Math.max(50, Number(e.target.value)))
              }
            />
          </div>

          <div className="form-item">
            <label>Office Latitude</label>
            <input
              type="number"
              value={latitude}
              step="0.000001"
              onChange={(e) => setLatitude(Number(e.target.value))}
            />
          </div>

          <div className="form-item">
            <label>Office Longitude</label>
            <input
              type="number"
              value={longitude}
              step="0.000001"
              onChange={(e) => setLongitude(Number(e.target.value))}
            />
          </div>

        </div>
      </motion.div>

      {/* ================= SECURITY ================= */}
      <motion.div 
        className="settings-card"
        whileHover={{ scale: 1.01 }}
      >
        <div className="card-header">
          <Shield size={22} />
          <h2>Anti-Spoofing & Security</h2>
        </div>

        <div className="form-item toggle">
          <label>Enable GPS Anti-Spoof Detection</label>
          <input
            type="checkbox"
            checked={antiSpoof}
            onChange={() => setAntiSpoof(!antiSpoof)}
          />
        </div>

        <div className="info-box">
          <Clock size={16} />
          Dynamic QR codes refresh automatically every {qrExpiry} seconds.
        </div>
      </motion.div>

      {/* ================= SAVE ================= */}
      <div className="save-section">
        <button onClick={handleSave} className="btn-save">
          <Save size={18} /> Save Settings
        </button>
      </div>

    </div>
  );
}