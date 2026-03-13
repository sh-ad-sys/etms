"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { CheckCircle, MapPin, ShieldCheck, Loader2, LogOut } from "lucide-react";
import useGeolocation from "../../../../lib/useGeolocation";
import "@/styles/attendance-qr.css";

interface QRSession { success: boolean; token: string; expires: string; }

const BASE = "http://localhost/etms/controllers";

export default function AttendanceQRPage() {

  const [time,         setTime]         = useState<Date>(new Date());
  const [refreshKey,   setRefreshKey]   = useState<number>(0);
  const [countdown,    setCountdown]    = useState<number>(30);
  const [session,      setSession]      = useState<QRSession | null>(null);
  const [verifying,    setVerifying]    = useState<boolean>(false);
  const [showSuccess,  setShowSuccess]  = useState<boolean>(false);
  const [lastAction,   setLastAction]   = useState<"check_in" | "check_out" | null>(null);
  const [checkInTime,  setCheckInTime]  = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [statusLoading,setStatusLoading]= useState(true);

  /* ── Clock ── */
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Today's check-in status (server-synced) ── */
  const fetchCheckInStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res  = await fetch(`${BASE}/attendance/get-checkin-status.php`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setLastAction(data.lastAction);
        setCheckInTime(data.checkInTime);
        setCheckOutTime(data.checkOutTime);
      }
    } catch { /* silent */ }
    finally  { setStatusLoading(false); }
  }, []);

  useEffect(() => { fetchCheckInStatus(); }, [fetchCheckInStatus]);

  /* ── QR Session ── */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res  = await fetch(`${BASE}/attendance/generate-session.php`, { credentials: "include" });
        const text = await res.text();
        if (!text.startsWith("{")) throw new Error("Invalid response");
        const data: QRSession = JSON.parse(text);
        if (data.success) setSession(data);
      } catch (e) { console.error("QR session error:", e); }
    };
    fetchSession();
  }, [refreshKey]);

  /* ── Countdown ── */
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setRefreshKey(k => k + 1); return 30; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Geolocation ── */
  const office       = { latitude: -1.5313, longitude: 37.2709 };
  const radiusMeters = 10000;
  const { position, loading: geoLoading, distanceMeters, inside } =
    useGeolocation(office, radiusMeters, { enableHighAccuracy: true, watch: true });

  /* ── Confirm attendance ── */
  const confirmPresence = async () => {
    if (!session || verifying) return;
    setVerifying(true);
    try {
      const res  = await fetch(`${BASE}/attendance/confirm.php`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token:          session.token,
          lat:            position?.latitude   ?? null,
          lng:            position?.longitude  ?? null,
          accuracy:       position?.accuracy   ?? null,
          distanceMeters: distanceMeters       ?? null,
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
        setRefreshKey(k => k + 1);
      } else {
        alert(data.error || "Attendance failed");
      }
    } catch (e) { console.error(e); alert("Server error"); }
    finally     { setVerifying(false); }
  };

  const qrValue  = useMemo(() => session?.token ?? "", [session]);
  const geoClass = geoLoading ? "qr-geo-checking"
    : inside ? "qr-geo-inside" : "qr-geo-outside";
  const geoLabel = geoLoading ? "Checking location…"
    : inside ? "Inside Attendance Zone" : "Outside Allowed Zone";

  return (
    <div className="qr-page">

      {/* Header */}
      <div className="qr-page-header">
        <h1>Confirm Attendance</h1>
        <p>Smart QR Verification System · Royal Mabati Factory</p>
      </div>

      <div className="qr-page-center">
        <div className="qr-card">

          {/* Geo pill */}
          <div className={`qr-geo-pill ${geoClass}`}>
            <MapPin size={14} /> {geoLabel}
          </div>

          {inside ? (
            <>
              <p className="qr-refresh-hint">QR refreshes every 30 seconds</p>

              {/* QR code */}
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

              {/* Today's times */}
              {(checkInTime || checkOutTime) && (
                <div className="qr-times-row">
                  {checkInTime  && <span className="qr-time-badge qr-time-in">✓ In {checkInTime}</span>}
                  {checkOutTime && <span className="qr-time-badge qr-time-out">✓ Out {checkOutTime}</span>}
                </div>
              )}

              {/* Confirm button */}
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
            </>
          ) : (
            <div className="qr-zone-blocked">
              <MapPin size={36} />
              You must be inside the attendance zone to confirm your attendance.
            </div>
          )}

          <div className="qr-clock">{time.toLocaleTimeString()}</div>

        </div>
      </div>

      {/* Success overlay */}
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