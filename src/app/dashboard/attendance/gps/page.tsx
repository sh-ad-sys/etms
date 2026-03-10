"use client";

import { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

export default function GPSAttendancePage() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  /* ======================================
     COMPANY GEO-FENCE
     (Move this to backend in production)
  ====================================== */
  const COMPANY_LAT = -1.2921;
  const COMPANY_LNG = 36.8219;
  const MAX_DISTANCE_METERS = 150;

  /* ======================================
     REQUEST LOCATION
  ====================================== */
  const requestLocation = () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // 🚨 Basic Anti-Spoof Detection
        if (accuracy > 1000) {
          setError("Suspicious GPS accuracy detected. Please disable mock location.");
          setLoading(false);
          return;
        }

        setLocation({
          latitude,
          longitude,
          accuracy,
        });

        const calculatedDistance = calculateDistance(
          latitude,
          longitude,
          COMPANY_LAT,
          COMPANY_LNG
        );

        setDistance(calculatedDistance);

        // ✅ In Production — Call API Instead
        if (calculatedDistance <= MAX_DISTANCE_METERS) {
          setStatus("success");
        } else {
          setStatus("error");
        }

        setLoading(false);
      },
      () => {
        setError("Location permission denied or unavailable.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  /* ======================================
     HAVERSINE FORMULA
  ====================================== */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const toRad = (value: number) => (value * Math.PI) / 180;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 flex justify-center items-center">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-10 border border-slate-200">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <MapPin className="text-blue-700" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              GPS Attendance Verification
            </h1>
            <p className="text-sm text-slate-500">
              Secure geo-fenced attendance validation
            </p>
          </div>
        </div>

        {/* LOCATION INFO */}
        {location.latitude && (
          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 mb-6 space-y-2">
            <p><strong>Latitude:</strong> {location.latitude}</p>
            <p><strong>Longitude:</strong> {location.longitude}</p>
            <p><strong>Accuracy:</strong> ±{location.accuracy} meters</p>
            {distance && (
              <p>
                <strong>Distance from Office:</strong>{" "}
                {Math.round(distance)} meters
              </p>
            )}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={requestLocation}
          disabled={loading}
          className="w-full bg-blue-800 hover:bg-blue-900 transition text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Verifying Secure Location...
            </>
          ) : (
            "Verify GPS Location"
          )}
        </button>
      </div>

      {/* STATUS MODAL */}
      {status && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-12 rounded-3xl shadow-2xl text-center animate-scaleIn max-w-sm w-full">
            {status === "success" ? (
              <>
                <CheckCircle2
                  size={64}
                  className="text-green-600 mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-green-600">
                  Location Verified
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  You are within authorized company premises.
                </p>
              </>
            ) : (
              <>
                <XCircle
                  size={64}
                  className="text-red-600 mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-red-600">
                  Outside Authorized Area
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Please move closer to the office location.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ANIMATION */}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out forwards;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}