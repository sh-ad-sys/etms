"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
const FULL_TEXT = "Royal Mabati ETMS";

type StatusType = "success" | "error" | null;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusType>(null);
  const [showStatus, setShowStatus] = useState(false);

  /* ===============================
     WORD-BY-WORD ANIMATION
  =============================== */
  const words = FULL_TEXT.split(" ");
  const [index, setIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    if (!showFull) {
      intervalId = window.setInterval(() => {
        setIndex((prev) => {
          if (prev + 1 === words.length) {
            clearInterval(intervalId);
            timeoutId = window.setTimeout(() => setShowFull(true), 600);
          }
          return prev + 1;
        });
      }, 450);
    } else {
      timeoutId = window.setTimeout(() => {
        setIndex(0);
        setShowFull(false);
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showFull, words.length]);

  /* ===============================
     LOGIN (SINGLE DASHBOARD REDIRECT)
  =============================== */
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setShowStatus(false);
  setStatusMessage(null); // reset previous message

  try {
    const response = await fetch(
      "http://localhost/etms/controllers/login.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send session cookie
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Show backend error message in popup
      setStatus("error");
      setStatusMessage(data.error || "Login failed");
      setShowStatus(true);
      setTimeout(() => {
  setShowStatus(false);
  setStatusMessage(null);
  setStatus(null);
}, 3000);
      return;
    }

    // Successful login
    setStatus("success");
    setStatusMessage("Login successful");
    setShowStatus(true);
    console.log("Role received from backend:", data.user.role);

    // Redirect based on role
  // Get role safely
const role = data.user.role?.trim().toUpperCase();

setTimeout(() => {
  switch (role) {
    case "ADMIN":
      router.push("/dashboard/admin");
      break;
    case "HR":
      router.push("/dashboard/hr");
      break;
    case "MANAGER":
      router.push("/dashboard/manager");
      break;
    case "SUPERVISOR":
      router.push("/dashboard/supervisor");
      break;
    default:
      router.push("/dashboard"); // staff
  }
}, 1200);

  } catch (error) {
    setStatus("error");
    setStatusMessage("An unexpected error occurred");
    setShowStatus(true);
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex bg-white relative">
      {/* ===============================
         LEFT BRAND PANEL
      =============================== */}
      <div className="hidden lg:grid w-2/3 grid-cols-[auto_1fr] items-center relative overflow-hidden">
        <div className="relative ml-24 z-10">
          <div className="relative w-85 h-85 rounded-full overflow-hidden border-8 border-blue-800 shadow-xl">
            <Image
              src="/see.jpeg"
              alt="Royal Mabati"
              fill
              priority
              sizes="340px"
              className="object-cover brightness-110 contrast-105 saturate-110"
            />
            <div className="absolute inset-0 bg-white/40" />
            <div className="absolute right-4 bottom-6 text-slate-900/40 text-sm font-semibold -rotate-90 tracking-widest select-none">
              ROYAL MABATI
            </div>
          </div>

          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full overflow-hidden border-4 border-blue-800 shadow-lg">
            <Image src="/up.jpeg" alt="" fill sizes="128px" />
          </div>

          <div className="absolute bottom-4 -left-10 w-24 h-24 rounded-full overflow-hidden border-4 border-blue-800 shadow-lg">
            <Image src="/down.jpeg" alt="" fill sizes="96px" />
          </div>
        </div>

        <div className="flex flex-col justify-center px-20 z-10">
          <p className="text-4xl font-extrabold tracking-tight text-slate-900">
            {showFull ? FULL_TEXT : words.slice(0, index).join(" ")}
          </p>
          <p className="mt-4 text-red-500 font-extrabold uppercase tracking-widest text-sm">
            Innovation &nbsp; Quality &nbsp; Creativity
          </p>
        </div>

        <div
          className="absolute -left-40 top-0 bg-blue-800 rounded-full opacity-10"
          style={{ width: 700, height: 700 }}
        />
        <div
          className="absolute -right-60 bottom-0 bg-slate-900 rounded-full opacity-5"
          style={{ width: 600, height: 600 }}
        />
      </div>

      {/* ===============================
         RIGHT LOGIN PANEL
      =============================== */}
      <div className="w-full lg:w-1/3 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-10">
          <div className="flex justify-center mb-8">
            <Image src="/logo.jpeg" alt="ETMS Logo" width={160} height={80} />
          </div>

          <h2 className="text-2xl font-semibold text-blue-800 text-center">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 mb-8 text-center">
            Sign in to access ETMS
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-800"
                placeholder="name.role@rmf.co.ke"
              />
            </div>

            
             <div>
  <label className="text-sm font-medium text-slate-700">
    Password <span className="text-red-500">*</span>
  </label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-800"
      placeholder="Enter password"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-3 flex items-center text-slate-500"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  <div className="mt-2 text-right">
    <Link
      href="/forgot-password"
      className="text-sm text-blue-800 hover:underline"
    >
      Forgot password?
    </Link>
  </div>
</div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-6 text-center">
            © {new Date().getFullYear()} Royal Mabati Factory — ETMS
          </p>
        </div>
      </div>

      {/* ===============================
         CENTER SUCCESS / ERROR ICON
      =============================== */}
      {showStatus && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center justify-center animate-scaleIn">
      {status === "success" ? (
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}

      {/* Display backend message */}
      <p className={`mt-4 text-center font-semibold ${status === "success" ? "text-blue-700" : "text-red-600"}`}>
        {statusMessage}
      </p>
    </div>
  </div>
)}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}