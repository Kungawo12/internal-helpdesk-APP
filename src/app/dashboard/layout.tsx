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
    <div className="min-h-screen relative selection:bg-primary selection:text-bg-darker">
      {/* Cinematic Background Layer */}
      <div className="app-bg" />
      <div className="app-overlay" />
      
      {/* Sidebar - Pro Glass */}
      <aside className="fixed top-6 left-6 bottom-6 w-64 hidden lg:flex flex-col glass-card rounded-[32px] z-40 p-6">
        <div className="mb-10 px-2">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-black text-bg-darker text-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-110 transition-transform">
              H
            </div>
            <span className="font-black text-xl tracking-tighter text-white">Helpdesk</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
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

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
              {session?.user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{session?.user?.name}</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{roleLabel}</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full btn-secondary py-2.5 text-xs border-danger/20 text-danger hover:bg-danger hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-80 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-4 left-4 right-4 h-16 z-50 glass-card rounded-2xl flex items-center justify-between px-6">
           <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-black text-bg-darker text-xs">H</div>
            <span className="font-black text-lg tracking-tighter text-white">Helpdesk</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white bg-white/10 rounded-xl"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-3xl pt-24 px-6 animate-fade-in">
             <nav className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-5 rounded-[24px] text-lg font-black transition-all ${
                      pathname === item.path ? "bg-primary text-bg-darker shadow-xl shadow-primary/30" : "text-slate-400 bg-white/5"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-[24px] text-lg font-black text-danger bg-danger/10 mt-10"
                >
                  <span>🚪</span> Sign Out
                </button>
             </nav>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-12 lg:pt-16 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
