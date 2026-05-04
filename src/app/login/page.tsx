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
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/assets/premium-bg-dark.png')] bg-cover bg-center bg-fixed flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="card p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl font-bold text-blue-600 text-xl mb-4 shadow-lg shadow-white/10">
              H
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
            <p className="text-sm text-white/70">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/90">Email Address</label>
              <input
                type="email"
                required
                className="input-field bg-white/10 text-white placeholder-white/40 border-white/20 focus:bg-white/20"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/90">Password</label>
              <input
                type="password"
                required
                className="input-field bg-white/10 text-white placeholder-white/40 border-white/20 focus:bg-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/30"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-sm text-white/70">
              Don't have an account?{" "}
              <Link href="/register" className="text-white font-bold hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
