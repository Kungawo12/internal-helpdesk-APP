"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] navbar-glass">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
              H
            </div>
            <span className="font-bold text-lg tracking-tight">Helpdesk</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-subtle hover:text-white transition-colors">Features</Link>
            <Link href="#enterprise" className="text-sm font-medium text-subtle hover:text-white transition-colors">Enterprise</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-white hover:text-primary transition-colors">Dashboard</Link>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary py-1.5 px-4"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-subtle hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="btn-primary py-2 px-5">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
