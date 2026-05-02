"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

export default function Navbar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    gsap.from(".nav-hud", {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] p-6 pointer-events-none">
      <div className="max-w-[1800px] mx-auto flex items-start justify-between pointer-events-auto">
        {/* Left HUD Bracket */}
        <div className="nav-hud hud-frame p-4 bg-transparent border-primary/20 backdrop-blur-md transform skew-x-[-12deg]">
          <div className="flex items-center gap-6 transform skew-x-[12deg]">
            <a href="/" className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-primary/10 border border-primary/50 flex items-center justify-center text-xl font-black chromatic-glow group-hover:scale-110 transition-transform">
                H
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-black tracking-[0.4em] text-white">NEURAL_DESK</p>
                <p className="text-[8px] font-mono text-primary uppercase">v1.0.4_STABLE</p>
              </div>
            </a>
            
            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
            
            <div className="hidden md:flex gap-8">
              {['Features', 'Specs', 'Pricing'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-primary transition-colors italic">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right HUD Bracket */}
        <div className="nav-hud flex items-center gap-4">
          {/* System Time Overlay */}
          <div className="hud-frame px-6 py-4 border-accent/20 hidden lg:block transform skew-x-[12deg]">
            <div className="transform skew-x-[-12deg]">
              <p className="text-[8px] font-black uppercase tracking-widest text-accent mb-1">Local_Node_Time</p>
              <p className="text-xl font-mono text-white tracking-widest">{time || "00:00:00"}</p>
            </div>
          </div>

          {/* Auth Portal */}
          <div className="hud-frame p-2 border-primary/30 transform skew-x-[-12deg]">
            <div className="flex gap-2 transform skew-x-[12deg]">
              <a href="/login" className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                Login
              </a>
              <a href="/register" className="px-8 py-2 bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </nav>
  );
}
