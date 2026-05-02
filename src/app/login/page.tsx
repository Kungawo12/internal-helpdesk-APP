"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-frame", {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "expo.out",
      });
      gsap.from(".login-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
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
      setError("Invalid Protocol Credentials");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <div className="hud-bg" />
      <div className="scanlines" />
      <div className="cyber-grid absolute inset-0" />

      <div className="login-frame w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <div className="login-item inline-flex items-center gap-4 mb-6 group cursor-pointer">
            <div className="w-14 h-14 bg-primary/10 border border-primary/50 flex items-center justify-center text-3xl font-black chromatic-glow group-hover:scale-110 transition-transform">
              H
            </div>
            <div className="text-left">
              <p className="text-[14px] font-black tracking-[0.5em] text-white">NEURAL_DESK</p>
              <p className="text-[10px] font-mono text-primary uppercase">SECURITY_PORTAL_V1</p>
            </div>
          </div>
          <h1 className="login-item text-4xl font-black italic uppercase tracking-tighter text-white">Verify_Access</h1>
        </div>

        <div className="hud-frame p-10 bg-hud-bg/20 backdrop-blur-3xl relative overflow-hidden group">
          <div className="scan-effect absolute inset-0 pointer-events-none opacity-20" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <div className="login-item p-4 hud-frame border-accent/40 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest text-center animate-glitch">
                {error}
              </div>
            )}

            <div className="login-item space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural_Identity (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                placeholder="ID_SEQUENCE@CORE.SYS"
                required
              />
            </div>

            <div className="login-item space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access_Key (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-item w-full py-5 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group/btn"
            >
              <span className="relative z-10">{loading ? "Establishing_Connection..." : "Authorize_Protocol"}</span>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 animate-glitch" />
            </button>

            <div className="login-item pt-6 text-center border-t border-white/5">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Identity not established?{" "}
                <a href="/register" className="text-primary hover:text-white transition-colors ml-2 italic underline underline-offset-4">
                  Initialize_Registration
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Technical Deco */}
        <div className="login-item mt-8 flex justify-between items-center opacity-30">
          <div className="text-[8px] font-mono text-slate-500">AES-256_ENCRYPTED_STREAM</div>
          <div className="flex gap-1">
             {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-primary/40" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
