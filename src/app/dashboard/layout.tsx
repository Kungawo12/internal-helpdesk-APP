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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const roleLabels: Record<string, string> = {
    employee: "Employee",
    manager: "Manager",
    it_staff: "IT Staff",
    hr_staff: "HR Staff",
  };
  const roleLabel = roleLabels[session?.user?.role || ""] || "Employee";

  const role = session?.user?.role;
  const navItems = [
    { label: "My Tickets", path: "/dashboard" },
    { label: "New Ticket", path: "/dashboard/create", show: role === "employee" || role === "manager" },
    { label: "Company Overview", path: "/dashboard/manager", show: role === "manager" },
    { label: "Ticket Queue", path: "/dashboard/staff", show: role === "it_staff" || role === "hr_staff" },
  ].filter((item) => item.show === undefined || item.show);

  return (
    <div className="min-h-screen relative">
      {/* Cinematic Background */}
      <div className="main-bg" />
      
      {/* Floating Navbar */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-500 rounded-[24px] ${
        scrolled ? "navbar-glass py-3 px-6 shadow-2xl" : "bg-transparent py-5 px-4"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-bold text-bg-darker text-sm shadow-[0_0_20px_rgba(56,189,248,0.5)] group-hover:scale-110 transition-transform">
                H
              </div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:block">Helpdesk</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === item.path
                      ? "bg-primary text-bg-darker shadow-lg shadow-primary/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-sm font-bold text-white tracking-tight">{session?.user?.name}</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{roleLabel}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[11px] font-bold text-white bg-white/5 hover:bg-danger border border-white/10 hover:border-danger px-4 py-2 rounded-xl transition-all hidden sm:block active:scale-95"
            >
              Sign Out
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full mt-4 glass p-6 rounded-[24px] space-y-3 animate-fade-in shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  pathname === item.path ? "bg-primary text-bg-darker" : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-5 py-4 rounded-2xl text-sm font-bold text-danger hover:bg-danger/10"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Aesthetic Footer Glow */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none z-[-1]" />
    </div>
  );
}
