"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useComms } from "@/hooks/useComms";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const { latestComms, hasNewMessage, markAsRead } = useComms();

  const roleLabels: Record<string, string> = {
    employee: "Employee",
    manager: "Manager",
    it_staff: "IT Staff",
    hr_staff: "HR Staff",
  };
  const roleLabel = roleLabels[session?.user?.role || ""] || "Employee";

  const role = session?.user?.role;
  const navItems = [
    { label: 'My Tickets', path: '/dashboard' },
    { label: 'New Ticket', path: '/dashboard/create', show: role === 'employee' || role === 'manager' },
    { label: 'Company Overview', path: '/dashboard/manager', show: role === 'manager' },
    { label: 'Ticket Queue', path: '/dashboard/staff', show: role === 'it_staff' || role === 'hr_staff' },
  ].filter(item => item.show === undefined || item.show);

  return (
    <div className="min-h-screen bg-bg-dark">
      <nav className="fixed top-0 left-0 w-full h-14 navbar-glass z-50 px-4 md:px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center font-bold text-white text-xs">
                H
              </div>
              <span className="font-bold text-sm tracking-tight hidden sm:block">Helpdesk</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    pathname === item.path 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Updates (useComms) */}
            <div className="relative">
              <button 
                onClick={() => { setShowUpdates(!showUpdates); markAsRead(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors relative"
              >
                <span className="text-sm">🔔</span>
                {hasNewMessage && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-bg-dark" />
                )}
              </button>

              {showUpdates && latestComms && (
                <div className="absolute top-10 right-0 w-80 card p-5 shadow-2xl animate-fade-in z-[60] border-primary/20">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Update</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{latestComms.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed font-medium whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {latestComms.content}
                  </div>
                  <button 
                    onClick={() => setShowUpdates(false)}
                    className="w-full mt-4 py-2 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-4 ml-1">
              <span className="text-xs font-bold text-white">{session?.user?.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{roleLabel}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[11px] font-bold text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg transition-colors hidden sm:block"
            >
              Sign Out
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-14 left-0 w-full bg-bg-dark border-b border-white/10 p-4 space-y-2 shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-bold ${
                  pathname === item.path ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-danger hover:bg-danger/5"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      <main className="pt-20 pb-12 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
