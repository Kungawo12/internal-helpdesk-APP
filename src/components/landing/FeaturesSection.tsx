"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "🎫",
    title: "Smart Ticket Engine",
    description:
      "Intelligent routing and categorization. Submit IT or HR requests with a few clicks and let our engine handle the rest.",
    color: "blue",
  },
  {
    icon: "⚡",
    title: "Instant Triage",
    description:
      "Automated priority assignment ensures that critical blockers are addressed immediately by the right team members.",
    color: "purple",
  },
  {
    icon: "💬",
    title: "Seamless Comms",
    description:
      "Built-in notification system keeps everyone in the loop via email and dashboard alerts at every step of the process.",
    color: "emerald",
  },
  {
    icon: "🛡️",
    title: "Role-Based Security",
    description:
      "Enterprise-grade permission system. Data is strictly siloed and accessible only to authorized personnel.",
    color: "amber",
  },
  {
    icon: "🧠",
    title: "Knowledge Base",
    description:
      "Every resolution contributes to an ever-growing library of solutions, reducing repeat issues and saving time.",
    color: "rose",
  },
  {
    icon: "📈",
    title: "Performance Data",
    description:
      "Comprehensive metrics for managers to track resolution times, team workload, and employee satisfaction.",
    color: "cyan",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
    glow: "shadow-rose-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
};

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feature-heading", {
        scrollTrigger: {
          trigger: ".feature-heading",
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power4.out",
      });

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 80%",
        },
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative py-40 px-6 overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-[20%] right-[-10%] glow-blob w-[400px] h-[400px] bg-blue-600/10" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="feature-heading text-center mb-24">
          <span className="inline-block px-5 py-2 rounded-full glass border-white/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            Capabilities
          </span>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter">
            Engineered for <span className="text-gradient">Efficiency</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A powerful suite of tools designed to streamline your internal operations and keep your workforce focused on what matters.
          </p>
        </div>

        <div className="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className="feature-card group relative glass rounded-[32px] p-10 border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                {/* Hover Glow */}
                <div className={`absolute -inset-20 bg-gradient-to-br from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rotate-12`} />
                
                <div
                  className={`relative z-10 w-16 h-16 ${colors.bg} border ${colors.border} rounded-2xl flex items-center justify-center text-3xl mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colors.glow}`}
                >
                  {feature.icon}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-base group-hover:text-slate-300 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle bottom accent */}
                <div className={`absolute bottom-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
