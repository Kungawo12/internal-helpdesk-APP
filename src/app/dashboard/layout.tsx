"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const roleLabel = session?.user?.role === 'admin' ? 'Manager' : 
                   session?.user?.role === 'staff' ? 'Staff' : 'Employee';

  return (
    <div className="min-h-screen bg-bg-dark">
      <nav className="fixed top-0 left-0 w-full h-16 navbar-glass z-50 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">
                H
              </div>
              <span className="font-bold text-base tracking-tight">Helpdesk</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'My Tickets', path: '/dashboard' },
                { label: 'Ticket Queue', path: '/dashboard/staff', role: 'staff' },
                { label: 'Company Overview', path: '/dashboard/manager', role: 'admin' },
                { label: 'New Ticket', path: '/dashboard/create' },
              ].filter(item => !item.role || session?.user?.role === item.role || (item.role === 'admin' && session?.user?.role === 'admin')).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.path 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-4">
              <span className="text-sm font-medium text-white">{session?.user?.name}</span>
              <span className="text-[11px] text-slate-500 font-medium">{roleLabel}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
