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
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Create Ticket", path: "/dashboard/create", icon: "➕", show: role === "employee" || role === "manager" },
    { label: "Company Overview", path: "/dashboard/manager", icon: "🏢", show: role === "manager" },
    { label: "Service Queue", path: "/dashboard/staff", icon: "⚡", show: role === "it_staff" || role === "hr_staff" },
  ].filter((item) => item.show === undefined || item.show);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-64 hidden lg:flex flex-col bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-40">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
              H
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Helpdesk</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-link ${pathname === item.path ? "sidebar-link-active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                {session?.user?.name?.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900 truncate">{session?.user?.name}</span>
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  {role?.replace("_", " ")}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        {/* Header - Mobile */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
           <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">H</div>
            <span className="font-bold text-lg text-slate-900">Helpdesk</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white pt-20 px-6">
             <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-semibold ${
                      pathname === item.path ? "bg-blue-50 text-blue-600" : "text-slate-500"
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="pt-6 mt-6 border-t border-slate-100">
                   <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-xl font-semibold text-red-600 bg-red-50"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
             </nav>
          </div>
        )}

        <main className="p-6 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
