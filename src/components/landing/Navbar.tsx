"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] navbar-glass">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white">Helpdesk</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">SaaS Platform</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="#enterprise" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Platform</Link>
            <Link href="#how-it-works" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Workflow</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {session ? (
            <>
              <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-white hover:text-primary transition-colors">Dashboard</Link>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary py-2 px-6 text-[11px] font-bold uppercase tracking-widest hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="btn-primary py-3 px-8 text-[11px] font-bold uppercase tracking-widest">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
