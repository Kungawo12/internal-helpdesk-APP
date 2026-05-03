"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 transition-all duration-500 rounded-[24px] ${
      scrolled ? "bg-black/60 border border-white/10 backdrop-blur-3xl py-4 px-10 shadow-2xl" : "bg-transparent py-8 px-6"
    }`}>
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-bg-darker text-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:rotate-12 transition-transform">
            H
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">Helpdesk</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {["Features", "Workflow", "Pricing"].map((item) => (
            <Link 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="text-sm font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-black text-white px-6 py-2 rounded-xl hover:bg-white/5 transition-all">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary px-8 h-12 text-xs">
            Join Platform
          </Link>
        </div>
      </div>
    </nav>
  );
}
