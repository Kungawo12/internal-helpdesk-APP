"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
    { label: "Overview", path: "/dashboard", icon: "📊" },
    { label: "New Ticket", path: "/dashboard/create", icon: "➕", show: role === "employee" || role === "manager" },
    { label: "Company", path: "/dashboard/manager", icon: "🏢", show: role === "manager" },
    { label: "Staff Queue", path: "/dashboard/staff", icon: "⚡", show: role === "it_staff" || role === "hr_staff" },
  ].filter((item) => item.show === undefined || item.show);

  return (
    <div className="min-h-screen relative font-sans">
      {/* Bright Professional Background */}
      <div className="app-bg" />
      <div className="app-overlay" />
      
      {/* Sidebar - Desktop */}
      <aside className="fixed top-0 left-0 h-full w-64 hidden lg:flex flex-col bg-white/40 border-r border-slate-200 backdrop-blur-3xl z-40">
        <div className="p-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-primary/30">
              H
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Helpdesk</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item ${pathname === item.path ? "sidebar-item-active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200 bg-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {session?.user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">{session?.user?.name}</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full btn-secondary py-2 text-xs"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden navbar-light fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6">
           <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-xs">H</div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">Helpdesk</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 bg-slate-100 rounded-xl"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6 animate-fade-in">
             <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold ${
                      pathname === item.path ? "bg-primary text-white" : "text-slate-600 bg-slate-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold text-red-600 bg-red-50 mt-8"
                >
                  <span>🚪</span> Sign Out
                </button>
             </nav>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-12 mt-16 lg:mt-0 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
