"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".nav-item", {
        opacity: 0,
        y: -10,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, navRef);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none"
    >
      <div 
        className={`nav-content max-w-5xl w-full flex items-center justify-between px-8 py-3 rounded-2xl transition-all duration-500 pointer-events-auto ${
          scrolled 
            ? "glass-dark border-white/10 shadow-2xl py-3 scale-[0.98]" 
            : "bg-transparent border-transparent py-5"
        }`}
      >
        {/* Logo */}
        <a href="/" className="nav-item flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-lg font-black shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-110">
            H
          </div>
          <span className="text-xl font-bold tracking-tighter">
            Helpdesk<span className="text-primary">.</span>
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          {["How it works", "Features", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="nav-item text-sm font-medium text-slate-400 hover:text-white transition-all hover:tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="nav-item flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-2"
          >
            Login
          </a>
          <a
            href="/register"
            className="group relative px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
          >
            Join Now
          </a>
        </div>
      </div>
    </nav>
  );
}
