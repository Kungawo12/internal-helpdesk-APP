"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type State = "checking" | "available" | "locked" | "done" | "error";

export default function AdminSetupPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin-portal/setup")
      .then((r) => r.json())
      .then((data) => {
        setState(data.setupRequired ? "available" : "locked");
      })
      .catch(() => setState("error"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin-portal/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setState("done");
        setTimeout(() => router.push("/admin/login"), 2000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Setup failed.");
        if (res.status === 409) setState("locked");
      }
    } catch {
      setErrorMsg("Connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-600/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-600/15 rounded-full blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Setup</h1>
          <p className="text-sm text-white/40 mt-1 font-medium text-center">Create the first administrator account</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">

          {/* Checking */}
          {state === "checking" && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Locked — admin already exists */}
          {state === "locked" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white">Admin account already exists</p>
              <p className="text-xs text-white/40">This setup page is now disabled. To add more admins, log in and use the Users page.</p>
              <Link href="/admin/login" className="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl transition-all mt-4">
                Go to Admin Login
              </Link>
            </div>
          )}

          {/* Done */}
          {state === "done" && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white">Admin account created!</p>
              <p className="text-xs text-white/40">Redirecting to login...</p>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-red-400 font-bold">Could not connect to server.</p>
              <button onClick={() => window.location.reload()} className="text-xs text-white/40 hover:text-white/70 underline">
                Retry
              </button>
            </div>
          )}

          {/* Setup form */}
          {state === "available" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400 font-bold text-center">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                {loading ? "Creating..." : "Create Admin Account"}
              </button>

              <p className="text-xs text-white/20 text-center">
                This page locks once the account is created. To add more admins later, use the Users page inside the portal.
              </p>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-xs text-white/20 hover:text-white/50 transition-colors font-medium">
            ← Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
