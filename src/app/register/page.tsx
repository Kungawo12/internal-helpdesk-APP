"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KarmaStaffLogo from "@/components/ui/KarmaStaffLogo";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "employee" }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed. Please try again.");
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
        <div className="max-w-lg text-slate-900 dark:text-white">
          <KarmaStaffLogo size={80} />
          <h1 className="text-5xl font-extrabold tracking-tight mt-8 mb-6 leading-tight text-slate-900 dark:text-white">
            Welcome to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 animate-gradient-shift bg-[length:200%_auto]">Karma Staff</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-white/70 font-medium leading-relaxed">
            The intelligent platform for managing internal operations, IT requests, and human resources effortlessly.
          </p>
        </div>
      </div>

      {/* Right Side Glassmorphic Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/10 dark:bg-white/10 dark:bg-white/10 backdrop-blur-2xl border border-white/20 dark:border-white/20 dark:border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-10 text-slate-900 dark:text-white">
          <Link
            href="/"
            className="flex items-center gap-2 mb-8 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:text-white transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-wider">Back to Home</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-slate-500 dark:text-white/60 font-medium">Join Karma Staff platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white/10 dark:bg-white/10 dark:bg-white/10 transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white/10 dark:bg-white/10 dark:bg-white/10 transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-white/80 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white/10 dark:bg-white/10 dark:bg-white/10 transition-all"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="w-full bg-white text-slate-900 font-extrabold py-3.5 rounded-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Creating Account..." : "Register Now"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 text-center">
            <p className="text-sm text-slate-500 dark:text-white/60 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-slate-900 dark:text-white font-bold hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
