"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "99.9%", label: "Platform Uptime", icon: "🌐" },
  { value: "< 2h", label: "Avg. Resolution", icon: "⚡" },
  { value: "12k+", label: "Tasks Optimized", icon: "⚙️" },
  { value: "4.9/5", label: "User Rating", icon: "💎" },
];

const roles = [
  {
    title: "Employees",
    description: "Submit and track requests through a beautiful, unified interface.",
    icon: "👤",
    capabilities: ["Intuitive Ticket Creation", "Live Progress Tracking", "Solution Repository", "Service Feedback"],
    color: "blue",
  },
  {
    title: "Managers",
    description: "High-level oversight of company performance and team metrics.",
    icon: "📊",
    capabilities: ["Global Dashboard View", "Real-time Analytics", "Departmental Silos", "SLA Monitoring"],
    color: "purple",
  },
  {
    title: "Support Staff",
    description: "Professional tools for IT and HR experts to resolve issues fast.",
    icon: "🛠️",
    capabilities: ["Smart Queue Management", "Automated Routing", "Resolution Logging", "Instant Staff Alerts"],
    color: "cyan",
  },
];

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-blue-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
};

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-item", {
        scrollTrigger: { trigger: ".stats-grid", start: "top 85%" },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".role-card", {
        scrollTrigger: { trigger: ".roles-grid", start: "top 80%" },
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-40 px-6 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute bottom-[10%] left-[-5%] glow-blob w-[500px] h-[500px] bg-purple-600/10" />
      
      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto mb-40">
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-item text-center p-10 rounded-[32px] glass border-white/5 hover:bg-white/[0.05] transition-all duration-500"
            >
              <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-white">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="inline-block px-5 py-2 rounded-full glass border-white/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            Ecosystem
          </span>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter">
            Tailored for <span className="text-gradient">Every Role</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience a workspace that adapts to your responsibilities, providing the exact tools you need to excel.
          </p>
        </div>

        <div className="roles-grid grid grid-cols-1 md:grid-cols-3 gap-10">
          {roles.map((role) => {
            const colors = colorMap[role.color];
            return (
              <div
                key={role.title}
                className="role-card group relative glass rounded-[40px] p-10 border-white/5 hover:border-white/20 transition-all duration-700 overflow-hidden"
              >
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    {role.icon}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">{role.title}</h3>
                  <p className="text-slate-400 mb-8 leading-relaxed text-base group-hover:text-slate-300 transition-colors">
                    {role.description}
                  </p>
                  
                  <ul className="space-y-4">
                    {role.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-center gap-4 text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors"
                      >
                        <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                        </div>
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Animated background accent */}
                <div className={`absolute -bottom-20 -right-20 w-64 h-64 ${colors.bg} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
