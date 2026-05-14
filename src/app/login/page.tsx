"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KarmaStaffLogo from "@/components/ui/KarmaStaffLogo";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
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

  const handleRegister = async (e: React.FormEvent) => {
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
        setSuccess("Account created! You can now sign in.");
        setName(""); setEmail(""); setPassword("");
        setTimeout(() => { setIsRegister(false); setSuccess(""); }, 1500);
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

  const switchMode = (toRegister: boolean) => {
    setError(""); setSuccess("");
    setIsRegister(toRegister);
  };

  const slide = (condition: boolean) => ({
    transform: condition ? "translateX(0%)" : "translateX(-110%)",
    transition: "transform 0.7s cubic-bezier(0.77,0,0.175,1)",
  });

  const slideRight = (condition: boolean) => ({
    transform: condition ? "translateX(0%)" : "translateX(110%)",
    transition: "transform 0.7s cubic-bezier(0.77,0,0.175,1)",
  });

  const fieldAnim = (i: number, visible: boolean) => ({
    transform: visible ? "translateX(0)" : "translateX(40px)",
    opacity: visible ? 1 : 0,
    filter: visible ? "blur(0)" : "blur(6px)",
    transition: `all 0.5s ease ${i * 0.08}s`,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1222] p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-[860px] h-[540px] rounded-3xl overflow-hidden shadow-2xl z-10 flex">

        {/* ── LOGIN FORM — slides out left when switching to register ── */}
        <div
          className="absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col justify-center px-10 py-8 bg-[#131c2e] z-20"
          style={slide(!isRegister)}
        >
          <FormInner
            mode="login"
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            error={error} success={success}
            loading={loading}
            onSubmit={handleLogin}
            onSwitch={() => switchMode(true)}
            fieldAnim={fieldAnim}
            active={!isRegister}
          />
        </div>

        {/* ── REGISTER FORM — anchored right, slides in from right ── */}
        <div
          className="absolute inset-y-0 right-0 w-full md:w-1/2 flex flex-col justify-center px-10 py-8 bg-[#131c2e] z-20"
          style={slideRight(isRegister)}
        >
          <FormInner
            mode="register"
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            error={error} success={success}
            loading={loading}
            onSubmit={handleRegister}
            onSwitch={() => switchMode(false)}
            fieldAnim={fieldAnim}
            active={isRegister}
          />
        </div>

        {/* ── BRANDING PANEL — slides left on register, right on login ── */}
        <div
          className="hidden md:flex absolute inset-y-0 right-0 w-1/2 flex-col items-center justify-center px-10 text-white text-center z-30 bg-gradient-to-br from-[#1a2540] to-[#0c1222] border-l border-white/5"
          style={{
            transform: isRegister ? "translateX(-100%)" : "translateX(0%)",
            transition: "transform 0.7s cubic-bezier(0.77,0,0.175,1)",
          }}
        >
          {/* Logo */}
          <KarmaStaffLogo size={72} />
          <h1 className="text-2xl font-black mt-6 mb-1 tracking-tight">Welcome to Karma Staff</h1>

          {isRegister ? (
            <>
              <p className="text-white/50 text-sm mb-8 font-medium leading-relaxed">
                Already have an account?<br />Sign in to continue.
              </p>
              <button
                onClick={() => switchMode(false)}
                className="border border-white/30 text-white px-8 py-2.5 rounded-full font-bold hover:bg-white hover:text-slate-900 transition-all text-sm"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm mb-8 font-medium leading-relaxed">
                New here? Create an account<br />and get started today.
              </p>
              <button
                onClick={() => switchMode(true)}
                className="border border-white/30 text-white px-8 py-2.5 rounded-full font-bold hover:bg-white hover:text-slate-900 transition-all text-sm"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Shared form inner ────────────────────────────────────────────────────────
function FormInner({
  mode, name, setName, email, setEmail, password, setPassword,
  error, success, loading, onSubmit, onSwitch, fieldAnim, active,
}: {
  mode: "login" | "register";
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  error: string; success: string; loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitch: () => void;
  fieldAnim: (i: number, visible: boolean) => React.CSSProperties;
  active: boolean;
}) {
  const isRegister = mode === "register";

  return (
    <div className="max-w-sm mx-auto w-full">
      <Link href="/" className="flex items-center gap-2 mb-6 text-white/40 hover:text-white transition-colors w-fit">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider">Back</span>
      </Link>

      <div className="mb-7" style={fieldAnim(0, active)}>
        <h2 className="text-3xl font-extrabold text-white mb-1.5">
          {isRegister ? "Create Account" : "Sign In"}
        </h2>
        <p className="text-white/50 text-sm font-medium">
          {isRegister ? "Join Karma Staff platform" : "Sign in to continue"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isRegister && (
          <div style={fieldAnim(1, active)}>
            <label className="block text-[11px] font-bold text-white/50 mb-1.5 uppercase tracking-widest">Full Name</label>
            <input
              type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-orange-400/70 focus:ring-1 focus:ring-orange-400/30 transition-all text-sm"
            />
          </div>
        )}

        <div style={fieldAnim(isRegister ? 2 : 1, active)}>
          <label className="block text-[11px] font-bold text-white/50 mb-1.5 uppercase tracking-widest">Email Address</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-orange-400/70 focus:ring-1 focus:ring-orange-400/30 transition-all text-sm"
          />
        </div>

        <div style={fieldAnim(isRegister ? 3 : 2, active)}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest">Password</label>
            {!isRegister && (
              <Link href="/forgot-password" className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                Forgot?
              </Link>
            )}
          </div>
          <input
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-orange-400/70 focus:ring-1 focus:ring-orange-400/30 transition-all text-sm"
          />
        </div>

        {error && (
          <div style={fieldAnim(isRegister ? 4 : 3, active)} className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl">
            <p className="text-xs text-red-300 font-bold text-center">{error}</p>
          </div>
        )}

        {success && (
          <div style={fieldAnim(isRegister ? 4 : 3, active)} className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
            <p className="text-xs text-emerald-300 font-bold text-center">{success}</p>
          </div>
        )}

        <div style={fieldAnim(isRegister ? 5 : 4, active)}>
          <button
            type="submit" disabled={loading}
            className="w-full bg-orange-500 text-white font-extrabold py-3 rounded-xl hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(249,115,22,0.25)] disabled:opacity-60 disabled:hover:scale-100 text-sm mt-1"
          >
            {loading ? "Please wait..." : (isRegister ? "Create Account" : "Sign In")}
          </button>
        </div>
      </form>

      {/* Mobile-only toggle */}
      <p className="mt-5 text-center text-xs text-white/40 font-medium md:hidden">
        {isRegister ? "Already have an account? " : "Don't have an account? "}
        <button onClick={onSwitch} className="text-white font-bold hover:underline">
          {isRegister ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
