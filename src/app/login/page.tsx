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
      setError("Access denied. Please verify your credentials.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 grid-subtle relative overflow-hidden">

      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-4 mb-10 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
              H
            </div>
            <div className="text-left">
              <span className="block font-black text-2xl tracking-tighter text-white uppercase">Helpdesk</span>
              <span className="block text-[10px] font-black text-primary uppercase tracking-[0.4em]">Enterprise</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Sign In</h1>
          <p className="text-slate-400 text-lg font-medium">Access your employee helpdesk.</p>
        </div>

        <div className="card p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-primary to-accent opacity-50" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="p-5 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm font-bold flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field py-4"
                placeholder="name@enterprise.com"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field py-4"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-lg font-bold uppercase tracking-wider"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="pt-8 text-center border-t border-white/5">
              <p className="text-sm text-subtle font-medium">
                New to the platform?{" "}
                <Link href="/register" className="text-primary hover:text-primary-light transition-colors font-black uppercase tracking-widest text-xs">
                  Request Access
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="mt-12 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          &copy; 2026 Helpdesk Systems International. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
