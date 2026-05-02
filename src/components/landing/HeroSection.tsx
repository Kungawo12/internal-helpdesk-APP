"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animation
      gsap.from(".hud-element", {
        opacity: 0,
        scale: 0.8,
        duration: 1.5,
        stagger: 0.2,
        ease: "expo.out",
      });

      // Orbital Rotation
      gsap.to(".orbital-ring", {
        rotation: 360,
        duration: 40,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".orbital-ring-reverse", {
        rotation: -360,
        duration: 30,
        repeat: -1,
        ease: "none",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* HUD Background Elements */}
      <div className="hud-bg" />
      <div className="scanlines" />
      <div className="cyber-grid absolute inset-0" />
      
      {/* Central Nexus Core */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <div className="hud-element relative mb-20">
          {/* Circular HUD Display */}
          <div className="w-64 h-64 md:w-[500px] md:h-[500px] rounded-full border border-primary/10 flex items-center justify-center relative">
            <div className="orbital-ring absolute inset-0 border-[1px] border-dashed border-primary/30 rounded-full scale-110" />
            <div className="orbital-ring-reverse absolute inset-0 border-[2px] border-primary/5 rounded-full scale-125 border-t-primary/40 border-l-transparent border-r-transparent border-b-transparent" />
            
            {/* Pulsing Core */}
            <div className="w-32 h-32 md:w-64 md:h-64 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center node-glow pulse-core relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="text-6xl md:text-9xl font-black text-primary opacity-80 group-hover:scale-110 transition-transform">⌘</span>
               {/* Scanning bar in core */}
               <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 scan-effect" />
            </div>

            {/* Floating Data Nodes (Orbital) */}
            <div className="absolute top-[10%] -right-[15%] hud-frame p-4 scale-75 md:scale-100 backdrop-blur-3xl chromatic-glow">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-2">Neural_Status</p>
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5,6].map(i => <div key={i} className="w-3 h-1 bg-primary/20 rounded-full overflow-hidden"><div className="w-full h-full bg-primary animate-pulse" style={{animationDelay: `${i*100}ms`}} /></div>)}
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase">SYS_STABLE: 99.98%</p>
            </div>
            
            <div className="absolute bottom-[20%] -left-[20%] hud-frame p-4 scale-75 md:scale-100 backdrop-blur-3xl chromatic-glow">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent mb-2">Thread_Analysis</p>
              <p className="text-3xl font-black text-white tabular-nums tracking-tighter">0.0024<span className="text-xs text-slate-500">ms</span></p>
              <div className="loading-bar w-full mt-2" />
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="hud-element space-y-10 max-w-5xl">
          <div className="inline-flex items-center gap-4 px-6 py-2 hud-frame border-primary/20 rounded-none transform skew-x-[-12deg]">
             <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
             <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white italic">Protocol_X7_Active</span>
          </div>
          
          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.8] italic uppercase transform skew-x-[-5deg]">
            <span className="block text-white">NEURAL</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary animate-shimmer bg-[length:200%_auto] chromatic-glow">DESK_01</span>
          </h1>
          
          <div className="max-w-2xl mx-auto space-y-8">
            <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-tight leading-relaxed">
              Experience the first <span className="text-primary italic font-black">Dimensionless Helpdesk</span>. No grids, no boxes, just pure operational intelligence.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-6">
              <button className="hud-frame px-16 py-6 group relative overflow-hidden transition-all hover:scale-110 active:scale-95 border-primary/50">
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                  Initialize Interface <span className="text-lg">→</span>
                </span>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/50 animate-glitch" />
              </button>
              
              <button className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 hover:text-primary transition-all flex items-center gap-4 group">
                <div className="w-12 h-[1px] bg-slate-800 group-hover:w-20 group-hover:bg-primary transition-all" />
                System Specs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extreme Decorative Overlays */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-10 left-10 text-[8px] font-mono text-primary uppercase">Coordinates: 34.0522° N, 118.2437° W</div>
         <div className="absolute bottom-10 right-10 text-[8px] font-mono text-accent uppercase">Protocol: HYPER_TICKETING_SECURE</div>
         <div className="absolute top-1/2 left-4 h-64 border-l border-primary/20 flex flex-col justify-between py-2">
            {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-[1px] bg-primary/40" />)}
         </div>
      </div>
    </section>
  );
}
