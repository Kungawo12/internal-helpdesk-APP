"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "98%", label: "Resolution Rate", icon: "✓" },
  { value: "2.4h", label: "Avg. Response Time", icon: "⚡" },
  { value: "500+", label: "Tickets Resolved", icon: "🎫" },
  { value: "4.8/5", label: "User Satisfaction", icon: "⭐" },
];

const roles = [
  {
    title: "Employee",
    description: "Create tickets, track status, view solutions, and give feedback.",
    icon: "👤",
    capabilities: ["Submit IT & HR tickets", "Track ticket status", "View posted solutions", "Rate resolutions"],
  },
  {
    title: "Manager",
    description: "Oversee all company tickets and monitor team performance.",
    icon: "📋",
    capabilities: ["Company-wide dashboard", "Filter by status & type", "View team metrics", "Monitor resolution times"],
  },
  {
    title: "IT & HR Staff",
    description: "Receive, manage, and resolve support tickets efficiently.",
    icon: "🛠️",
    capabilities: ["Email notifications", "Assign & resolve tickets", "Post solutions", "Manage ticket queue"],
  },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".stat-item", {
        scrollTrigger: { trigger: ".stats-grid", start: "top 85%" },
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".role-card", {
        scrollTrigger: { trigger: ".roles-grid", start: "top 80%" },
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6">
      {/* Stats */}
      <div className="max-w-6xl mx-auto mb-32">
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-item text-center p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold stat-glow mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            For Everyone
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for Every Role
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Each user gets a tailored experience designed for their
            specific needs and responsibilities.
          </p>
        </div>

        <div className="roles-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className="role-card card-glow bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
              <p className="text-slate-400 mb-6">{role.description}</p>
              <ul className="space-y-3">
                {role.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 text-xs">&#10003;</span>
                    </span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
