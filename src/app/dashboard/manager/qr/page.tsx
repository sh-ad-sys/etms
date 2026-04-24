"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { CheckCircle, MapPin, ShieldCheck, Loader2, LogOut } from "lucide-react";
import useGeolocation from "../../../../lib/useGeolocation";
import "@/styles/attendance-qr.css";

interface QRSession { success: boolean; token: string; expires: string; }

const BASE = "http://localhost/etms/controllers";

function parseSessionExpiry(value: string | undefined): number {
  if (!value) return 0;

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const expiresAt = new Date(normalized).getTime();

  return Number.isNaN(expiresAt) ? 0 : expiresAt;
}

export default function ManagerQRPage() {
  const [time, setTime] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(30);
  const [session, setSession] = useState<QRSession | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<"check_in" | "check_out" | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchCheckInStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`${BASE}/attendance/get-checkin-status.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setLastAction(data.lastAction);
        setCheckInTime(data.checkInTime);
        setCheckOutTime(data.checkOutTime);
      }
    } catch {
      // Keep the UI resilient if the status call fails.
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => { fetchCheckInStatus(); }, [fetchCheckInStatus]);

  const fetchSession = useCallback(async (): Promise<QRSession | null> => {
    try {
      const res = await fetch(`${BASE}/attendance/generate-session.php`, { credentials: "include" });
      const text = await res.text();
      if (!text.startsWith("{")) throw new Error("Invalid response");
      const data: QRSession = JSON.parse(text);
      if (data.success) {
        setSession(data);
        setCountdown(30);
        return data;
      }
    } catch (error) {
      console.error("QR session error:", error);
    }

    return null;
  }, []);

  const ensureFreshSession = useCallback(async (): Promise<QRSession | null> => {
    if (!session) return fetchSession();

    const expiresAt = parseSessionExpiry(session.expires);
    if (!expiresAt || expiresAt - Date.now() <= 5000) {
      return fetchSession();
    }

    return session;
  }, [fetchSession, session]);

  useEffect(() => { fetchSession(); }, [fetchSession, refreshKey]);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRefreshKey((value) => value + 1);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const office = { latitude: -1.5313, longitude: 37.2709 };
  const radiusMeters = 10000;
  const { position, loading: geoLoading, distanceMeters, inside } =
    useGeolocation(office, radiusMeters, { enableHighAccuracy: true, watch: true });

  const confirmPresence = async () => {
    if (verifying) return;
    setVerifying(true);
    try {
      const activeSession = await ensureFreshSession();
      if (!activeSession) {
        alert("Refreshing secure QR. Please try again.");
        return;
      }

      const res = await fetch(`${BASE}/attendance/confirm.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: activeSession.token,
          lat: position?.latitude ?? null,
          lng: position?.longitude ?? null,
          accuracy: position?.accuracy ?? null,
          distanceMeters: distanceMeters ?? null,
          inside,
        }),
      });

      const text = await res.text();
      if (!text.startsWith("{")) throw new Error("Invalid response");
      const data = JSON.parse(text);

      if (data.success) {
        setLastAction(data.action);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        fetchCheckInStatus();
        setRefreshKey((value) => value + 1);
      } else {
        alert(data.error || "Attendance failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setVerifying(false);
    }
  };

  const qrValue = useMemo(() => session?.token ?? "", [session]);
  const geoClass = geoLoading ? "qr-geo-checking" : inside ? "qr-geo-inside" : "qr-geo-unavailable";
  const geoLabel = geoLoading
    ? "Checking location..."
    : inside
      ? "Inside Attendance Zone"
      : "Location optional for manager check-in";

  return (
    <div className="qr-page">
      <div className="qr-page-header">
        <h1>Manager Check-In</h1>
        <p>Executive QR attendance. Location is recorded, but not required for manager check-in.</p>
      </div>

      <div className="qr-page-center">
        <div className="qr-card">
          <div className={`qr-geo-pill ${geoClass}`}>
            <MapPin size={14} /> {geoLabel}
          </div>

          <p className="qr-refresh-hint">QR refreshes every 30 seconds</p>

          <div className="qr-code-box">
            {!qrValue ? (
              <div className="qr-code-loading">
                <Loader2 size={32} className="spin" />
              </div>
            ) : (
              <>
                <QRCodeCanvas
                  key={refreshKey}
                  value={qrValue}
                  size={220}
                  level="H"
                  includeMargin
                />
                <div className="qr-logo-center">
                  <Image src="/logo.jpeg" alt="logo" width={42} height={42} />
                </div>
              </>
            )}
          </div>

          <p className="qr-countdown-text">
            Refreshing in <b>{countdown}s</b>
          </p>

          {(checkInTime || checkOutTime) && (
            <div className="qr-times-row">
              {checkInTime && <span className="qr-time-badge qr-time-in">In {checkInTime}</span>}
              {checkOutTime && <span className="qr-time-badge qr-time-out">Out {checkOutTime}</span>}
            </div>
          )}

          <button
            onClick={confirmPresence}
            disabled={verifying || statusLoading || !session}
            className={`qr-btn ${lastAction === "check_in" ? "qr-btn-checkout" : "qr-btn-checkin"}`}
          >
            {statusLoading
              ? <><Loader2 size={16} className="spin" /> Loading...</>
              : verifying
                ? <><Loader2 size={16} className="spin" /> Verifying...</>
                : lastAction === "check_in"
                  ? <><LogOut size={17} /> Check Out</>
                  : <><CheckCircle size={17} /> Check In</>
            }
          </button>

          <div className="qr-secure">
            <ShieldCheck size={13} /> Secure Verification
          </div>

          <div className="qr-clock">{time.toLocaleTimeString()}</div>
        </div>
      </div>

      {showSuccess && (
        <div className="qr-success-overlay">
          <div className="qr-success-card">
            <div className="qr-success-icon-wrap">
              <CheckCircle size={42} />
            </div>
            <h3>Attendance Recorded</h3>
            <p>{lastAction === "check_in" ? "Checked in" : "Checked out"} successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}
