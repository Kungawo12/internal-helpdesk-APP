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
    // Breathing Mesh for Dashboard
    gsap.to(".prism-mesh", {
      x: "5%",
      y: "3%",
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  const role = session?.user?.role;
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "New Ticket", path: "/dashboard/create", icon: "➕", show: role === "employee" },
    { label: "Company Overview", path: "/dashboard/manager", icon: "🏢", show: role === "manager" },
    { label: "Ticket Queue", path: "/dashboard/staff", icon: "⚡", show: role === "it_staff" || role === "hr_staff" },
  ].filter((item) => item.show === undefined || item.show);

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row overflow-hidden">
      {/* Dynamic Motion Background */}
      <div className="prism-bg">
        <div className="prism-mesh" />
        <div 
          className="prism-wallpaper bg-cover bg-center" 
          style={{ backgroundImage: 'url("/assets/premium-bg-light.png")' }} 
        />
      </div>
      
      {/* Sidebar - Desktop */}
      <aside className="w-80 hidden lg:flex flex-col p-8 fixed top-0 bottom-0 left-0 z-40">
        <div className="glass-panel h-full flex flex-col p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border-white/60">
          <div className="mb-14 px-2">
            <Link href="/dashboard" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-xl group-hover:rotate-12 transition-transform duration-500">
                H
              </div>
              <span className="font-extrabold text-3xl tracking-tighter text-[#0f172a]">Helpdesk</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group ${
                  pathname === item.path 
                    ? "bg-[#0f172a] text-white shadow-2xl shadow-slate-900/20 scale-[1.02]" 
                    : "text-[#475569] hover:bg-white hover:text-[#0f172a] hover:translate-x-2"
                }`}
              >
                <span className={`text-2xl group-hover:scale-110 transition-transform ${pathname === item.path ? "" : "grayscale opacity-50"}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-tight">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="bg-white/40 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-inner">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-200 shadow-sm">
                  {session?.user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-[#0f172a] truncate">{session?.user?.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="status-pulse bg-emerald-500 w-1.5 h-1.5" />
                     <span className="text-[10px] text-blue-600 uppercase font-black tracking-widest">
                       {role?.replace("_", " ")}
                     </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full py-3 rounded-2xl bg-[#0f172a] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#1e293b] hover:shadow-xl transition-all shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-80 flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-20 glass-nav flex items-center justify-between px-8 sticky top-0 z-50">
           <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center font-bold text-white text-lg">H</div>
            <span className="font-extrabold text-xl text-[#0f172a]">Helpdesk</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-xl"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl pt-24 px-8 overflow-y-auto">
             <nav className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-6 px-8 py-5 rounded-[24px] font-black ${
                      pathname === item.path ? "bg-[#0f172a] text-white shadow-2xl" : "text-slate-500"
                    }`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-lg">{item.label}</span>
                  </Link>
                ))}
                <div className="pt-8 mt-8 border-t border-slate-100">
                   <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-6 px-8 py-5 rounded-[24px] font-black text-red-600 bg-red-50"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
             </nav>
          </div>
        )}

        <main className="p-8 md:p-12 lg:p-16 relative z-10">
          <div className="max-w-6xl mx-auto page-reveal">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
