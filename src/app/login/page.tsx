"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Sign in failed. Please check your credentials.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-dark grid-subtle relative overflow-hidden">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-white text-base">
              H
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Helpdesk</span>
          </Link>
          <h1 className="text-xl font-bold text-white mb-1">Sign In</h1>
          <p className="text-slate-500 text-sm font-medium">Access your enterprise support account</p>
        </div>

        <div className="card p-6 shadow-2xl border-white/5 bg-white/[0.02]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {justRegistered && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider text-center">
                Registration Complete
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field py-2 text-sm"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field py-2 text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-bold uppercase tracking-widest"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="pt-4 text-center border-t border-white/5">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                New to the platform?{" "}
                <Link href="/register" className="text-primary hover:text-primary-light transition-colors">
                  Request Access
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest opacity-50">
          &copy; 2026 Helpdesk System
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
