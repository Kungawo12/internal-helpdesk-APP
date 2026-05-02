"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      {/* Clean Navbar */}
      <header className="fixed top-0 left-0 w-full z-[100] navbar-glass">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                 <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">
                    H
                 </div>
                 <span className="font-bold text-base tracking-tight">Helpdesk</span>
              </Link>
              
              <nav className="flex items-center gap-1">
                 {visibleNav.map((item) => (
                    <Link
                       key={item.href}
                       href={item.href}
                       className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          pathname === item.href ? "bg-white/5 text-white" : "text-subtle hover:text-white"
                       }`}
                    >
                       {item.label}
                    </Link>
                 ))}
              </nav>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                 <span className="text-xs font-bold text-white">{session.user.name}</span>
                 <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{roleLabels[role] || role}</span>
              </div>
              
              <button
                 onClick={() => signOut({ callbackUrl: "/" })}
                 className="btn-secondary py-1 px-3 text-[10px]"
              >
                 Sign Out
              </button>
           </div>
        </div>
      </header>

      {/* Tight Main Content */}
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
