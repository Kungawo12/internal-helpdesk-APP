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

  const role = session?.user?.role;
  const navItems = [
    { label: "Overview", path: "/dashboard", icon: "📊" },
    { label: "New Ticket", path: "/dashboard/create", icon: "➕", show: role === "employee" || role === "manager" },
    { label: "Company", path: "/dashboard/manager", icon: "🏢", show: role === "manager" },
    { label: "Staff Queue", path: "/dashboard/staff", icon: "⚡", show: role === "it_staff" || role === "hr_staff" },
  ].filter((item) => item.show === undefined || item.show);

  return (
    <div className="min-h-screen relative selection:bg-primary/30">
      {/* Visual Foundation */}
      <div className="app-bg" />
      <div className="app-overlay" />
      
      {/* Compact Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-56 hidden lg:flex flex-col bg-black/40 border-r border-white/5 backdrop-blur-2xl z-40">
        <div className="p-5 mb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-base shadow-lg shadow-primary/20">
              H
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Helpdesk</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item ${pathname === item.path ? "sidebar-item-active" : ""}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto bg-black/20">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {session?.user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{session?.user?.name}</span>
              <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                {role?.replace("_", " ")}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full btn-secondary py-1.5 text-[11px] border-white/5 hover:bg-white/5"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-56 flex flex-col min-h-screen">
        {/* Compact Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 z-50 bg-black/60 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-4">
           <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center font-bold text-white text-xs">H</div>
            <span className="font-bold text-base tracking-tight text-white">Helpdesk</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-white/70 hover:text-white"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-bg-darker/95 backdrop-blur-3xl pt-20 px-4 animate-fade-in">
             <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-bold ${
                      pathname === item.path ? "bg-primary text-white" : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-bold text-red-400 bg-red-400/5 mt-6"
                >
                  <span>🚪</span> Sign Out
                </button>
             </nav>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 mt-14 lg:mt-0 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
