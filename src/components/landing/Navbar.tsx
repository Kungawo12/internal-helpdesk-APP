"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 transition-all duration-500 rounded-[24px] ${
        scrolled || isMobileMenuOpen ? "bg-black/60 border border-white/10 backdrop-blur-3xl py-4 px-6 md:px-10 shadow-2xl" : "bg-transparent py-8 px-6"
      }`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(56,189,248,0.4)]">
              H
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">Helpdesk</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                className="text-sm font-black text-slate-300 hover:text-white uppercase tracking-widest transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-black text-white px-6 py-2 rounded-xl hover:bg-white/5 transition-all">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary px-8 h-12 text-xs">
              Get Started
            </Link>
            
            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-8 pb-4 space-y-4 animate-fade-in">
            {navLinks.map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg font-black text-slate-300 hover:text-white uppercase tracking-[0.2em] transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/5 space-y-4">
               <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-lg font-black text-white uppercase tracking-[0.2em]"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
