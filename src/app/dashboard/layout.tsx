"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import KarmaStaffLogo from "@/components/ui/KarmaStaffLogo";
import { useState, useEffect, useRef } from "react";
import AiChatWidget from "@/components/dashboard/AiChatWidget";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

interface Notification {
  id: string;
  type: string;
  message: string;
  ticketId: string | null;
  read: boolean;
  createdAt: string;
}

function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifications(await res.json());
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) markAllRead();
  };

  const typeIcon: Record<string, string> = {
    TICKET_ASSIGNED: "📋",
    TICKET_COMMENT: "💬",
    TICKET_ESCALATED: "⬆",
    TICKET_RESOLVED: "✅",
    TICKET_REOPENED: "🔄",
    TICKET_IN_PROGRESS: "⚡",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow hover:bg-slate-50 dark:hover:bg-slate-100 dark:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 dark:bg-red-500 text-slate-900 dark:text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-black text-slate-900 dark:text-white">Notifications</span>
            {notifications.some((n) => !n.read) && (
              <button onClick={markAllRead} className="text-xs text-blue-600 font-bold hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-500 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (n.ticketId) router.push(`/dashboard/ticket/${n.ticketId}`);
                    setOpen(false);
                  }}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-100 dark:bg-slate-800 transition-colors ${!n.read ? "bg-blue-50/60" : ""}`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium leading-snug">{n.message}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const role = session?.user?.role;
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "New Ticket", path: "/dashboard/create", icon: "➕", show: role === "employee" },
    { label: "Knowledge Base", path: "/dashboard/kb", icon: "📚", show: role === "employee" },
    { label: "Ticket Queue", path: "/dashboard/staff", icon: "⚡", show: role === "it_staff" || role === "hr_staff" },
    { label: "Users", path: "/dashboard/users", icon: "👥", show: role === "admin" },
    { label: "All Tickets", path: "/dashboard/tickets", icon: "🎫", show: role === "admin" },
    { label: "Analytics", path: "/dashboard/analytics", icon: "📊", show: role === "admin" },
    { label: "KB Manage", path: "/dashboard/kb-manage", icon: "📖", show: role === "admin" },
  ].filter((item) => item.show === undefined || item.show);

  const sidebarW = collapsed ? "w-20" : "w-80";
  const mainPl = collapsed ? "lg:pl-20" : "lg:pl-80";

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row overflow-hidden bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-300">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center opacity-40 dark:opacity-10 transition-opacity"
          style={{ backgroundImage: 'url("/assets/premium-bg-light.png")' }}
        />
      </div>

      {/* Sidebar - Desktop */}
      <aside className={`${sidebarW} hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ${collapsed ? "p-3" : "p-8"}`}>
        <div className="bg-white dark:bg-slate-800/90 rounded-[32px] h-full flex flex-col shadow-2xl border border-white/60 dark:border-slate-700/60 transition-all duration-300 overflow-hidden relative">

          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shadow-sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo */}
          <div className={`flex items-center transition-all duration-300 ${collapsed ? "justify-center pt-6 pb-8 px-0" : "px-8 pt-8 pb-10"}`}>
            <Link href="/dashboard" className="flex items-center gap-3 group flex-shrink-0">
              <KarmaStaffLogo size={collapsed ? 32 : 40} className="group-hover:scale-105 transition-transform duration-300 drop-shadow-xl flex-shrink-0" />
              {!collapsed && (
                <span className="font-extrabold text-xl tracking-tighter text-slate-900 dark:text-white transition-all duration-300 whitespace-nowrap overflow-hidden">
                  Karma Staff
                </span>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav className={`flex-1 space-y-2 ${collapsed ? "px-2" : "px-4"}`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-2xl font-bold transition-all duration-300 group ${
                  collapsed ? "justify-center px-0 py-3.5" : "gap-4 px-5 py-4"
                } ${
                  pathname === item.path
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:text-white dark:hover:text-white"
                }`}
              >
                <span className={`text-xl flex-shrink-0 transition-transform group-hover:scale-110 ${pathname === item.path ? "" : "grayscale opacity-60"}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="text-sm tracking-tight whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          </nav>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${mainPl} flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-300`}>
        {/* Top bar — desktop only */}
        <div className="hidden lg:flex items-center justify-end gap-3 px-8 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 sticky top-0 z-30 transition-colors">
          <ThemeToggle />
          <NotificationBell />
          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-slate-600 flex-shrink-0">
              {session?.user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{session?.user?.name?.split(" ")[0]}</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{role?.replace("_", " ")}</span>
            </div>
          </Link>
          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm"
            aria-label="Sign out"
            title="Sign Out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-white dark:bg-slate-900/90 flex items-center justify-between px-8 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <Link href="/dashboard" className="flex items-center gap-2">
            <KarmaStaffLogo size={28} className="drop-shadow-md" />
            <span className="font-extrabold text-xl text-slate-900 dark:text-white">Karma Staff</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-xl"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-slate-800 pt-24 px-8 overflow-y-auto">
            <nav className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-6 px-8 py-5 rounded-[24px] font-black ${
                    pathname === item.path ? "bg-blue-600 text-white shadow-2xl shadow-blue-900/20" : "text-slate-500 dark:text-slate-500"
                  }`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-lg">{item.label}</span>
                </Link>
              ))}
              <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
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
      <AiChatWidget />
    </div>
  );
}
