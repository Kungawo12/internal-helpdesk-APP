"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useComms } from "@/hooks/useComms";

const roleLabels: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  it_staff: "IT Staff",
  hr_staff: "HR Staff",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const { latestComms, hasNewMessage, markAsRead } = useComms();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!session) return null;

  const role = session.user.role;

  const navItems = [
    { href: "/dashboard", label: "My Tickets", roles: ["employee", "manager", "it_staff", "hr_staff"] },
    { href: "/dashboard/create", label: "New Ticket", roles: ["employee", "manager"] },
    { href: "/dashboard/manager", label: "Analytics", roles: ["manager"] },
    { href: "/dashboard/staff", label: "Ticket Queue", roles: ["it_staff", "hr_staff"] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-bg-dark text-slate-200">
      {/* Professional Sidebar/Header */}
      <header className="fixed top-0 left-0 w-full z-[100] navbar-glass">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                    H
                 </div>
                 <span className="font-bold text-lg tracking-tight">Helpdesk</span>
              </Link>
              
              <nav className="flex items-center gap-1">
                 {visibleNav.map((item) => (
                    <Link
                       key={item.href}
                       href={item.href}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname === item.href ? "bg-white/5 text-white" : "text-subtle hover:text-white"
                       }`}
                    >
                       {item.label}
                    </Link>
                 ))}
              </nav>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                 <span className="text-sm font-bold text-white">{session.user.name}</span>
                 <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{roleLabels[role] || role}</span>
              </div>
              
              <button
                 onClick={() => signOut({ callbackUrl: "/" })}
                 className="btn-secondary py-1.5 px-4 text-xs"
              >
                 Sign Out
              </button>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[1600px] mx-auto">
          {/* New Comms Alert */}
          {hasNewMessage && latestComms && (
            <div className="mb-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-4">
                <span className="text-xl">📩</span>
                <div>
                  <p className="text-sm font-bold text-white">New message from Claude (Backend)</p>
                  <p className="text-xs text-subtle">{latestComms.date}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/comms" 
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-110"
                  onClick={markAsRead}
                >
                  Read Message
                </Link>
                <button 
                  onClick={markAsRead}
                  className="px-4 py-2 bg-white/5 text-subtle text-xs font-bold rounded-lg hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
