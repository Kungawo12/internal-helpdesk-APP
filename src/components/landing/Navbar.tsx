"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useComms } from "@/hooks/useComms";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { hasNewMessage, markAsRead, latestComms } = useComms();
  const [showComms, setShowComms] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] navbar-glass">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              H
            </div>
            <div className="flex flex-col -gap-1">
              <span className="font-black text-xl tracking-tight text-white uppercase">Helpdesk</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Enterprise</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Strategic Features</Link>
            <Link href="#enterprise" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Operational Ecosystem</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Comms Notification */}
          <div className="relative border-r border-white/10 pr-6 mr-1">
            <button 
              onClick={() => { setShowComms(!showComms); markAsRead(); }}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors relative"
            >
              <span>Comms</span>
              {hasNewMessage && (
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </button>

            {showComms && latestComms && (
              <div className="absolute top-10 right-0 w-80 card p-6 shadow-2xl animate-fade-in z-[60] border-primary/20">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tactical Feed</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{latestComms.date}</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {latestComms.content}
                </div>
                <button 
                  onClick={() => setShowComms(false)}
                  className="w-full mt-4 py-2 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {session ? (
            <>
              <Link href="/dashboard" className="text-xs font-black uppercase tracking-widest text-white hover:text-primary transition-colors">Protocol Dashboard</Link>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary py-2 px-6 text-[11px] font-black uppercase tracking-widest border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-400"
              >
                Exit Session
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Portal Login</Link>
              <Link href="/register" className="btn-primary py-3 px-8 text-[11px] font-black uppercase tracking-widest">Establish Access</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
