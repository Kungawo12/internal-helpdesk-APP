"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import gsap from "gsap";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Subtle entrance for sidebar
    gsap.from(".sidebar-animate", {
      x: -20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, []);

  const role = session?.user?.role;
  const navItems = [
    { label: "My Tickets", path: "/dashboard", icon: "📊" },
    { label: "New Ticket", path: "/dashboard/create", icon: "➕", show: role === "employee" },
    { label: "Overview", path: "/dashboard/manager", icon: "🏢", show: role === "manager" },
    { label: "Ticket Queue", path: "/dashboard/staff", icon: "⚡", show: role === "it_staff" || role === "hr_staff" },
  ].filter((item) => item.show === undefined || item.show);

  return (
    <div className="min-h-screen relative selection:bg-primary/30 font-outfit">
      {/* Cinematic Foundation */}
      <div className="app-bg" />
      <div className="app-overlay" />
      
      {/* Premium Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 hidden lg:flex flex-col bg-black/40 border-r border-white/5 backdrop-blur-[32px] z-40">
        <div className="sidebar-animate p-8 mb-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-[0_0_30px_rgba(14,165,233,0.4)] group-hover:scale-110 transition-transform">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-white leading-none">Helpdesk</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">SaaS_Elite</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="sidebar-animate text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Operations_Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-animate sidebar-link ${pathname === item.path ? "sidebar-link-active" : ""}`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-animate p-6 mt-auto">
          <div className="glass-card bg-white/[0.03] p-4 border-white/5 group hover:bg-white/[0.05] transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-white/10 flex items-center justify-center text-primary font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                {session?.user?.name?.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">{session?.user?.name}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                  {role?.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
            >
              Terminate_Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Cinematic Header (Mobile) */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 bg-black/60 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-6">
           <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-black text-white text-sm">H</div>
            <span className="font-black text-lg tracking-tighter text-white">Helpdesk</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Advanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-bg-darker/98 backdrop-blur-3xl pt-24 px-6 animate-fade-in">
             <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                      pathname === item.path ? "bg-primary/20 text-primary border border-primary/20" : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="tracking-tight">{item.label}</span>
                  </Link>
                ))}
                <div className="pt-8 mt-8 border-t border-white/5">
                   <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold text-red-400 bg-red-400/5"
                  >
                    <span>🚪</span> Terminate Session
                  </button>
                </div>
             </nav>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 lg:p-12 mt-16 lg:mt-0">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
