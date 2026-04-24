"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { API_ENDPOINTS, setToken } from "@/config/api";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setShowStatus(false);
    setStatusMessage(null);
    setStatus(null);

    try {
      console.log("?? Attempting login to:", API_ENDPOINTS.login);

      const response = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("? Response received. Status:", response.status);

      const data = await response.json();
      console.log("?? Response data:", data);

      if (!response.ok) {
        console.error("? Login failed:", data);
        setStatus("error");
        setStatusMessage(data.error || `Login failed (${response.status})`);
        setShowStatus(true);
        setLoading(false);
        setTimeout(() => {
          setShowStatus(false);
          setStatusMessage(null);
          setStatus(null);
        }, 3000);
        return;
      }

      console.log("? Login successful");
      setStatus("success");
      setStatusMessage("Login successful");
      setShowStatus(true);

      if (data.token) {
        console.log("?? Token stored");
        setToken(data.token);
      }

      const role = data.user?.role?.trim().toUpperCase();
      console.log("?? User role:", role);

      setTimeout(() => {
        setLoading(false);
        if (data.mustChangePassword) {
          console.log("?? Redirecting to first-login-password");
          router.push("/first-login-password");
          return;
        }

        console.log("?? Redirecting based on role:", role);
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
            console.log("?? Unknown role, going to default dashboard");
            router.push("/dashboard");
        }
      }, 2400);
    } catch (error) {
      console.error("? Fetch error:", error);
      setLoading(false);
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      setShowStatus(true);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef4ff_52%,#fefce8_100%)]">
      <div className="relative hidden w-2/3 grid-cols-[auto_1fr] items-center overflow-hidden lg:grid">
        <div className="relative z-10 ml-24">
          <div className="relative h-85 w-85 overflow-hidden rounded-full border-8 border-[#1a3a6b] shadow-[0_18px_45px_rgba(26,58,107,0.18)]">
            <Image
              src="/see.jpeg"
              alt="Royal Mabati"
              fill
              priority
              sizes="340px"
              className="object-cover brightness-110 contrast-105 saturate-110"
            />
            <div className="absolute inset-0 bg-[#1a3a6b]/12" />
            <div className="absolute bottom-6 right-4 select-none -rotate-90 text-sm font-semibold tracking-widest text-slate-900/40">
              ROYAL MABATI
            </div>
          </div>

          <div className="absolute -right-8 -top-8 h-32 w-32 overflow-hidden rounded-full border-4 border-[#1a3a6b] shadow-[0_10px_28px_rgba(26,58,107,0.18)]">
            <Image src="/up.jpeg" alt="" fill sizes="128px" />
          </div>

          <div className="absolute bottom-4 -left-10 h-24 w-24 overflow-hidden rounded-full border-4 border-[#1a3a6b] shadow-[0_10px_28px_rgba(26,58,107,0.18)]">
            <Image src="/down.jpeg" alt="" fill sizes="96px" />
          </div>
        </div>

        <div className="z-10 flex flex-col justify-center px-20">
          <p className="text-4xl font-extrabold tracking-tight text-[#1a3a6b]">
            {showFull ? FULL_TEXT : words.slice(0, index).join(" ")}
          </p>
          <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-[#dc2626]">
            Innovation &nbsp; Quality &nbsp; Creativity
          </p>
        </div>

        <div
          className="absolute -left-40 top-0 rounded-full bg-[#1a3a6b] opacity-10"
          style={{ width: 700, height: 700 }}
        />
        <div
          className="absolute -right-60 bottom-0 rounded-full bg-[#f59e0b] opacity-10"
          style={{ width: 600, height: 600 }}
        />
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/3">
        <div className="w-full max-w-md rounded-3xl border border-[#dbeafe] bg-white/95 p-10 shadow-[0_18px_50px_rgba(26,58,107,0.12)] backdrop-blur">
          <div className="mb-8 flex justify-center">
            <Image src="/logo.jpeg" alt="ETMS Logo" width={160} height={80} />
          </div>

          <h2 className="text-center text-2xl font-semibold text-[#1a3a6b]">
            Welcome Back
          </h2>
          <p className="mb-8 text-center text-sm text-slate-500">
            Sign in to access ETMS
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[#475569]">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                placeholder="name.role@rmf.co.ke"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#475569]">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                  placeholder="Enter password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-[#1a3a6b]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#2563eb] hover:text-[#1a3a6b] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[linear-gradient(135deg,#1a3a6b,#2563eb)] py-3 font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Royal Mabati Factory - ETMS
          </p>
        </div>
      </div>

      {showStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="login-status-card animate-scaleIn flex w-[min(92vw,360px)] flex-col items-center justify-center px-8 py-10">
            <div
              className={`login-status-badge ${
                status === "success" ? "bg-[#dbeafe] text-[#1a3a6b]" : "bg-[#fee2e2] text-[#dc2626]"
              }`}
            >
              {status === "success" ? (
                <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
                  <circle className="login-ring" cx="50" cy="50" r="40" />
                  <path className="login-check" d="M32 52 L45 65 L69 39" />
                </svg>
              ) : (
                <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
                  <circle className="login-ring" cx="50" cy="50" r="40" />
                  <line className="login-cross" x1="36" y1="36" x2="64" y2="64" />
                  <line className="login-cross login-cross-second" x1="64" y1="36" x2="36" y2="64" />
                </svg>
              )}
            </div>

            <p
              className={`mt-5 text-center text-2xl font-semibold ${
                status === "success" ? "text-[#1a3a6b]" : "text-[#dc2626]"
              }`}
            >
              {statusMessage}
            </p>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.32s ease-out forwards;
        }

        .login-status-badge {
          display: grid;
          place-items: center;
          width: 136px;
          height: 136px;
          border-radius: 9999px;
        }

        .login-status-badge :global(circle),
        .login-status-badge :global(path),
        .login-status-badge :global(line) {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .login-ring {
          stroke-width: 6;
          stroke-dasharray: 252;
          stroke-dashoffset: 252;
          animation: drawRing 1.4s ease-out forwards;
          transform: rotate(-90deg);
          transform-origin: center;
        }

        .login-check {
          stroke-width: 7;
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: drawMark 0.7s ease-out 1.2s forwards;
        }

        .login-cross {
          stroke-width: 7;
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: drawMark 0.28s ease-out 0.9s forwards;
        }

        .login-cross-second {
          animation-delay: 1.18s;
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes drawRing {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawMark {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
