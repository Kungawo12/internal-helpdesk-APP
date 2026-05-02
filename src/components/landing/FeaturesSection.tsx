"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const features = [
  {
    title: "Neural_Triage",
    desc: "Autonomous categorization of incoming threads using advanced cognitive mapping.",
    icon: "🧠",
    coords: "top-0 left-0"
  },
  {
    title: "Quantum_SLA",
    desc: "Time-dilation protocols that prioritize critical operational failures in real-time.",
    icon: "⏳",
    coords: "top-20 right-20"
  },
  {
    title: "Core_Analytics",
    desc: "Multi-dimensional data visualization for enterprise-scale decision making.",
    icon: "📊",
    coords: "bottom-10 left-20"
  },
  {
    title: "Sync_Protocols",
    desc: "Seamless inter-departmental data transmission with zero latency.",
    icon: "📡",
    coords: "bottom-0 right-10"
  }
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xPos = (clientX / innerWidth - 0.5) * 10;
      const yPos = (clientY / innerHeight - 0.5) * 10;

      gsap.to(".features-grid", {
        rotateY: xPos,
        rotateX: -yPos,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={sectionRef} className="py-40 relative overflow-hidden perspective-2000">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32">
          <div className="inline-block hud-frame px-4 py-1 border-accent/20 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Feature_Protocols</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-cyber">
            Operational<br /><span className="text-primary">Infrastructures</span>
          </h2>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-2 gap-12 relative">
          {/* Central Connecting Lines (Visual Decor) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-[1px] bg-primary/40" />
            <div className="h-full w-[1px] bg-primary/40" />
            <div className="absolute w-40 h-40 border border-primary/40 rounded-full animate-ping" />
          </div>

          {features.map((f, i) => (
            <div 
              key={i} 
              className="hud-frame p-10 group relative transition-all duration-500 hover:bg-primary/[0.03] hover:border-primary/40 scan-effect cursor-pointer"
            >
              <div className="absolute -top-4 -left-4 text-xs font-mono text-primary/40">NODE_0{i + 1}</div>
              
              <div className="flex items-start gap-8 mb-6">
                <div className="text-5xl opacity-80 group-hover:scale-125 transition-transform group-hover:rotate-12">{f.icon}</div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2 group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <div className="h-[2px] w-12 bg-primary/20 group-hover:w-full transition-all duration-700" />
                </div>
              </div>

              <p className="text-slate-400 font-medium leading-relaxed tracking-tight group-hover:text-slate-200 transition-colors">
                {f.desc}
              </p>

              {/* HUD Deco corner */}
              <div className="absolute bottom-4 right-4 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                {[1,2,3].map(j => <div key={j} className="w-1 h-3 bg-primary" />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Overlays */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
    </section>
  );
}
