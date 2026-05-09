"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
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
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
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
            href="/"
            className="flex items-center gap-2 mb-8 text-white/60 hover:text-white transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-bold uppercase tracking-wider">Back to Home</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-2 text-white">Welcome Back</h2>
            <p className="text-white/60 font-medium">Sign in to continue to the dashboard.</p>
          </div>

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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-white/80 uppercase tracking-wide">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-bold text-blue-300 hover:text-white transition-colors">
                  Recover
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white/10 transition-all"
                placeholder="••••••••"
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
              className="w-full bg-white text-slate-900 font-extrabold py-3.5 rounded-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center space-y-3">
            <p className="text-sm text-white/60 font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-white font-bold hover:underline">
                Register here
              </Link>
            </p>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
