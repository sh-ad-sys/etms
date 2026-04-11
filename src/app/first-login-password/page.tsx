"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost/etms/controllers/complete-first-login-password.php";

export default function FirstLoginPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to update password.");
        return;
      }
      setMessage(data.message || "Password updated successfully.");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("Unable to update password right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#eef4ff_52%,#fefce8_100%)] px-6 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#dbeafe] bg-white/95 p-10 shadow-[0_18px_50px_rgba(26,58,107,0.12)] backdrop-blur">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#dc2626]">First Login Security</p>
        <h1 className="text-3xl font-bold text-[#1a3a6b]">Set a strong password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your temporary password worked, but you must set a strong password before continuing.
          Use at least 8 characters with uppercase, lowercase, a number, and a symbol.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-[#475569]">New Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
              placeholder="Strong password"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#475569]">Confirm Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
              placeholder="Repeat new password"
            />
          </div>

          {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[linear-gradient(135deg,#1a3a6b,#2563eb)] py-3 font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Updating password..." : "Save Strong Password"}
          </button>
        </form>
      </div>
    </div>
  );
}