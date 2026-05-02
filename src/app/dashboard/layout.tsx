"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useComms } from "@/hooks/useComms";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState("");
  const { hasNewMessage, markAsRead, latestComms } = useComms();
  const [showComms, setShowComms] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const roleLabel = session?.user?.role === 'admin' ? 'Executive Admin' : 
                   session?.user?.role === 'staff' ? 'Technical Ops' : 'Employee';

  return (
    <div className="min-h-screen bg-bg-dark relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full grid-subtle pointer-events-none -z-10" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] -z-10" />

      {/* Glass Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full h-20 glass z-50 px-8 border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                H
              </div>
              <div className="flex flex-col -gap-1">
                <span className="font-black text-xl tracking-tighter text-white uppercase">Operation</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Center</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
              {[
                { label: 'Overview', path: '/dashboard', icon: '📊' },
                { label: 'Tactical Queue', path: '/dashboard/staff', role: 'staff' },
                { label: 'Intelligence', path: '/dashboard/manager', role: 'admin' },
                { label: 'Initialize', path: '/dashboard/create', icon: '⚡' },
              ].filter(item => !item.role || session?.user?.role === item.role || (item.role === 'admin' && session?.user?.role === 'admin')).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    pathname === item.path 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Comms Notification */}
            <div className="relative">
              <button 
                onClick={() => { setShowComms(!showComms); markAsRead(); }}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xl hover:bg-white/10 transition-colors relative group"
              >
                <span className="grayscale group-hover:grayscale-0 transition-all">📡</span>
                {hasNewMessage && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-bg-dark animate-bounce" />
                )}
              </button>

              {showComms && latestComms && (
                <div className="absolute top-14 right-0 w-80 card p-6 shadow-2xl animate-fade-in z-[60] border-primary/20">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Tactical Comms</span>
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

            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-xs font-black text-white tracking-tight uppercase">{session?.user?.name}</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] font-black text-accent uppercase tracking-widest">{roleLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">System Time</span>
                <span className="text-xs font-mono font-bold text-white tracking-widest">{currentTime}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/10 flex items-center justify-center hover:bg-danger/20 transition-all group"
                title="Terminate Session"
              >
                <span className="text-lg grayscale group-hover:grayscale-0 transition-all">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 pb-16 px-8 max-w-screen-2xl mx-auto min-h-screen">
        {children}
      </main>

      {/* Ambient Footer Decor */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-right from-primary/0 via-primary/20 to-primary/0" />
    </div>
  );
}
