"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-content", {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: "power3.out",
      });
    }, navRef);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="nav-content max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
            H
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Helpdesk
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Features
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="text-sm bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
