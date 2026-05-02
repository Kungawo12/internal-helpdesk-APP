"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const roleLabels: Record<string, string> = {
  employee: "Staff Member",
  manager: "Fleet Manager",
  it_staff: "Systems Engineer",
  hr_staff: "Human Capital",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.from(headerRef.current, {
      y: -20,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  if (!session) return null;

  const role = session.user.role;

  const navItems = [
    { href: "/dashboard", label: "My Hub", roles: ["employee", "manager", "it_staff", "hr_staff"], icon: "🏠" },
    { href: "/dashboard/create", label: "Initialize Ticket", roles: ["employee", "manager"], icon: "➕" },
    { href: "/dashboard/manager", label: "Enterprise View", roles: ["manager"], icon: "📊" },
    { href: "/dashboard/staff", label: "Active Queue", roles: ["it_staff", "hr_staff"], icon: "⚡" },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-200 overflow-x-hidden">
      {/* Global Aesthetics */}
      <div className="mesh-gradient opacity-30" />
      <div className="noise" />
      
      {/* Premium Header */}
      <header 
        ref={headerRef}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-6xl"
      >
        <div className="glass rounded-[28px] border-white/5 p-2 px-6 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-lg font-black shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-110">
                H
              </div>
              <span className="font-black tracking-tighter text-xl hidden md:block">
                Helpdesk<span className="text-primary">.</span>
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-2">
              {visibleNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`group relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    pathname === item.href
                      ? "text-primary"
                      : "text-slate-500 hover:text-slate-200"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-sm opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                    {item.label}
                  </span>
                  {pathname === item.href && (
                    <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                  )}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <p className="text-xs font-black tracking-tight text-white">{session.user.name}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">
                  {roleLabels[role] || role}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px]">
                <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center text-[10px] font-black">
                  {session.user.name?.charAt(0)}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Background Glows */}
      <div className="glow-blob w-[600px] h-[600px] bg-primary/5 top-0 left-[-10%] opacity-50" />
      <div className="glow-blob w-[400px] h-[400px] bg-secondary/5 bottom-0 right-[-10%] opacity-30" />
    </div>
  );
}
