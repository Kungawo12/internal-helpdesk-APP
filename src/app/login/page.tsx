"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-darker grid-subtle relative overflow-hidden">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-xl">
              H
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">Helpdesk</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-slate-500 text-sm font-medium">Sign in to your account</p>
        </div>

        <div className="card p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field py-2 text-sm"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
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
              className="btn-primary w-full py-3 text-sm font-bold uppercase tracking-wider"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-xs text-slate-500 font-medium">
                New to the platform?{" "}
                <Link href="/register" className="text-primary hover:underline font-bold">
                  Request Access
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="mt-10 text-center text-[10px] font-medium text-slate-600 uppercase tracking-widest">
          &copy; 2026 Helpdesk. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
