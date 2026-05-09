"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">
      {/* Global Animated Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/30 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Left Side Branding */}
      <div className="hidden lg:flex w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <div className="w-16 h-16 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center font-bold text-3xl mb-8 shadow-2xl">
            H
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Prism <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 animate-gradient-shift bg-[length:200%_auto]">Enterprise</span>
          </h1>
          <p className="text-xl text-white/70 font-medium leading-relaxed">
            The intelligent platform for managing internal operations, IT requests, and human resources effortlessly.
          </p>
        </div>
      </div>

      {/* Right Side Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-10 text-white">
          <Link
            href="/login"
            className="flex items-center gap-2 mb-8 text-white/60 hover:text-white transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-wider">Back to Sign In</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-2 text-white">Forgot Password</h2>
            <p className="text-white/60 font-medium">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-white/80 font-medium">
                If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox.
              </p>
              <Link
                href="/login"
                className="block w-full bg-white text-slate-900 font-extrabold py-3.5 rounded-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white/10 transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl backdrop-blur-md">
                  <p className="text-sm text-red-200 font-bold text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-slate-900 font-extrabold py-3.5 rounded-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
