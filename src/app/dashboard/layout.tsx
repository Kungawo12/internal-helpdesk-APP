"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const roleLabels: Record<string, string> = {
  employee: "OPERATIVE",
  manager: "CORE_MANAGER",
  it_staff: "SYS_ENGINEER",
  hr_staff: "HUMAN_LOGISTICS",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session) return null;

  const role = session.user.role;

  // SPEC REQUIREMENT: Navigation items based on role
  const navItems = [
    { href: "/dashboard", label: "My_Threads", roles: ["employee", "manager", "it_staff", "hr_staff"] },
    { href: "/dashboard/create", label: "New_Protocol", roles: ["employee", "manager"] },
    { href: "/dashboard/manager", label: "Enterprise_HUD", roles: ["manager"] },
    { href: "/dashboard/staff", label: "Operational_Queue", roles: ["it_staff", "hr_staff"] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="relative min-h-screen bg-bg-dark text-slate-200 overflow-x-hidden">
      <div className="hud-bg" />
      <div className="scanlines" />
      
      {/* Hyper-HUD Header */}
      <header className="fixed top-0 left-0 w-full z-[100] px-8 py-4 pointer-events-none">
        <div className="max-w-[1800px] mx-auto flex items-start justify-between pointer-events-auto">
           {/* Left Branding */}
           <div className="hud-frame p-3 border-primary/20 bg-hud-bg/10 backdrop-blur-3xl transform skew-x-[-12deg]">
              <div className="flex items-center gap-6 transform skew-x-[12deg]">
                 <a href="/" className="flex items-center gap-4 group">
                    <div className="w-8 h-8 bg-primary/10 border border-primary/50 flex items-center justify-center text-lg font-black chromatic-glow group-hover:scale-110 transition-transform">
                       H
                    </div>
                    <div className="hidden sm:block">
                       <p className="text-[10px] font-black tracking-[0.4em] text-white">NEURAL_DESK</p>
                    </div>
                 </a>
                 <div className="h-6 w-[1px] bg-white/10" />
                 <div className="flex gap-6">
                    {visibleNav.map((item) => (
                       <a
                          key={item.href}
                          href={item.href}
                          className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all italic ${
                             pathname === item.href ? "text-primary" : "text-slate-500 hover:text-slate-200"
                          }`}
                       >
                          {item.label}
                       </a>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Profile & Actions */}
           <div className="flex items-center gap-4">
              <div className="hud-frame px-5 py-3 border-primary/10 bg-white/5 hidden lg:block transform skew-x-[12deg]">
                 <div className="transform skew-x-[-12deg] flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-white uppercase tracking-tight">{session.user.name}</p>
                       <p className="text-[8px] font-mono text-primary uppercase">{roleLabels[role] || role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center text-[10px] font-black bg-primary/10">
                       {session.user.name?.charAt(0)}
                    </div>
                 </div>
              </div>

              <div className="hud-frame p-2 border-accent/20 transform skew-x-[-12deg]">
                 <div className="flex items-center gap-4 transform skew-x-[12deg]">
                    <div className="px-4 py-2 text-[12px] font-mono text-accent tracking-widest hidden md:block">
                       {time}
                    </div>
                    <button
                       onClick={() => signOut({ callbackUrl: "/" })}
                       className="px-6 py-2 bg-accent/10 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
                    >
                       Term_Session
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-32 pb-20 px-8">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Status Bar Decor */}
      <div className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center opacity-30 pointer-events-none z-50">
         <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Core_Load: 42% | Thread_Efficiency: 98.2%</div>
         <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Protocol: HYPER_HUD_ENABLED_V1.0.4</div>
      </div>
    </div>
  );
}
