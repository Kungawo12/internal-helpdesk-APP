"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

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

  if (!session) return null;

  const role = session.user.role;

  const navItems = [
    { href: "/dashboard", label: "My Tickets", roles: ["employee", "manager", "it_staff", "hr_staff"] },
    { href: "/dashboard/create", label: "Create Ticket", roles: ["employee", "manager"] },
    { href: "/dashboard/manager", label: "Overview", roles: ["manager"] },
    { href: "/dashboard/staff", label: "Ticket Queue", roles: ["it_staff", "hr_staff"] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="border-b border-white/[0.06] bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
                H
              </div>
              <span className="font-semibold hidden sm:inline">Helpdesk</span>
            </a>

            <nav className="flex items-center gap-1">
              {visibleNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-slate-500">
                {roleLabels[role] || role}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
