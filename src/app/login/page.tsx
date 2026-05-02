"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-card", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power4.out",
      });
      gsap.from(".login-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.4,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
      setError("Invalid credentials. Please check your email and password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Premium Background */}
      <div className="mesh-gradient" />
      <div className="noise" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="glow-blob w-[400px] h-[400px] bg-primary/20 top-[-10%] right-[-10%]" />
      <div className="glow-blob w-[300px] h-[300px] bg-secondary/10 bottom-[-10%] left-[-10%]" />

      <div className="login-card relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <a href="/" className="login-item inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl font-black shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-110">
              H
            </div>
            <span className="text-2xl font-bold tracking-tighter">
              Helpdesk<span className="text-primary">.</span>
            </span>
          </a>
          <h1 className="login-item text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="login-item text-slate-400 font-medium tracking-tight">Access your operations dashboard</p>
        </div>

        {/* Form Container */}
        <div className="glass rounded-[40px] p-10 border-white/5 shadow-2xl overflow-hidden relative group">
          {/* Subtle animated border */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {error && (
              <div className="login-item p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="login-item">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                placeholder="name@company.com"
                required
              />
            </div>

            <div className="login-item">
              <div className="flex items-center justify-between mb-2.5 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-item w-full py-4 bg-primary rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Enter Workspace"}
            </button>

            <div className="login-item pt-4 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                New here?{" "}
                <a
                  href="/register"
                  className="text-primary hover:text-white transition-colors ml-1"
                >
                  Create Identity
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="login-item mt-10 text-center">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            Enterprise-Grade Security Protocol Active
          </p>
        </div>
      </div>
    </div>
  );
}
