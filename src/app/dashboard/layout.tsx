"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
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
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-4">
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
          <div className="lg:hidden absolute top-14 left-0 w-full bg-bg-darker border-b border-white/10 animate-fade-in p-4 space-y-2 shadow-2xl">
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

      <main className="pt-20 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
