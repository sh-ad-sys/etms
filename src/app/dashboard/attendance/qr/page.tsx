"use client";

import { useEffect, useState, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { CheckCircle, MapPin, ShieldCheck } from "lucide-react";
import useGeolocation from "../../../../lib/useGeolocation";

interface QRSession {
  success: boolean;
  token: string;
  expires: string;
}

export default function AttendanceQRPage() {

  const [time, setTime] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(30);

  const [session, setSession] = useState<QRSession | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const [lastAction, setLastAction] = useState<"check_in" | "check_out" | null>(null);

  /* ================= CLOCK ================= */

  useEffect(() => {
    const clock = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  /* ================= SESSION REFRESH ================= */

  useEffect(() => {

    const fetchSession = async () => {

      try {

        const res = await fetch(
          "http://localhost/etms/controllers/attendance/generate-session.php",
          { credentials: "include" }
        );

        const text = await res.text();

        if (!text.startsWith("{")) throw new Error("Invalid server response");

        const data: QRSession = JSON.parse(text);

        if (data.success) {
          setSession(data);
        }

      } catch (err) {
        console.error("QR session error:", err);
      }
    };

    fetchSession();

  }, [refreshKey]);

  /* ================= COUNTDOWN ================= */

  useEffect(() => {

    const interval = setInterval(() => {

      setCountdown(prev => {

        if (prev <= 1) {
          setRefreshKey(k => k + 1);
          return 30;
        }

        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  /* ================= GEOLOCATION ================= */

  const office = {
    latitude: -1.5313,
    longitude: 37.2709
  };

  const radiusMeters = 10000;

  const { position, loading, distanceMeters, inside } =
    useGeolocation(office, radiusMeters, {
      enableHighAccuracy: true,
      watch: true
    });

  /* ================= CONFIRM ATTENDANCE ================= */

  const confirmPresence = async () => {

    if (!session) {
      alert("QR session not ready");
      return;
    }

    if (verifying) return;

    setVerifying(true);

    try {

      const res = await fetch(
        "http://localhost/etms/controllers/attendance/confirm.php",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: session.token,
            lat: position?.latitude ?? null,
            lng: position?.longitude ?? null,
            accuracy: position?.accuracy ?? null,
            distanceMeters: distanceMeters ?? null,
            inside: inside
          })
        }
      );

      const text = await res.text();

      if (!text.startsWith("{")) throw new Error("Invalid server response");

      const data = JSON.parse(text);

      if (data.success) {

        setLastAction(data.action);

        setShowSuccess(true);

        setTimeout(() => setShowSuccess(false), 2500);

      } else {
        alert(data.error || "Attendance failed");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setVerifying(false);
  };

  /* ================= QR VALUE ================= */

  const qrValue = useMemo(() => {
    if (!session) return "";

    return session.token;
  }, [session]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 to-blue-50 p-6 md:p-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Confirm Attendance
        </h1>
        <p className="text-sm text-slate-500">
          Smart QR Verification System
        </p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md text-center border">

          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="text-blue-600" size={18} />

            <span className="text-sm text-slate-600">
              {loading
                ? "Checking location..."
                : inside
                  ? "Inside Attendance Zone"
                  : "Outside Allowed Zone"}
            </span>
          </div>

          {inside ? (
            <>
              <p className="text-sm text-slate-500">
                QR refreshes every 30 seconds
              </p>

              <div className="mt-6 flex justify-center">
                <div className="relative bg-white p-6 rounded-2xl shadow-md">

                  {qrValue && (
                    <QRCodeCanvas
                      key={refreshKey}
                      value={qrValue}
                      size={220}
                      level="H"
                    />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-full p-2 shadow">
                      <Image
                        src="/logo.jpeg"
                        alt="logo"
                        width={45}
                        height={45}
                      />
                    </div>
                  </div>

                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Refreshing in <b>{countdown}s</b>
              </p>

              <button
                onClick={confirmPresence}
                disabled={verifying}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {verifying
                  ? "Verifying..."
                  : lastAction === "check_in"
                    ? "Check Out"
                    : "Check In"}
              </button>

              <div className="mt-4 text-xs text-slate-400 flex justify-center gap-1 items-center">
                <ShieldCheck size={14} />
                Secure Verification
              </div>

            </>
          ) : (
            <div className="py-12 text-slate-500">
              You must be inside the attendance location.
            </div>
          )}

          <div className="mt-8 text-xs text-slate-400">
            {time.toLocaleTimeString()}
          </div>

        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-10 rounded-3xl text-center shadow-xl">
            <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600">
              Attendance Recorded
            </h3>
          </div>
        </div>
      )}

    </div>
  );
}