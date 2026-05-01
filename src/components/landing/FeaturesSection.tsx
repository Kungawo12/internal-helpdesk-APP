"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "🎫",
    title: "Smart Ticket Creation",
    description:
      "Submit IT or HR tickets in seconds with an intuitive form. Categorize, set priority, and describe your issue effortlessly.",
    color: "blue",
  },
  {
    icon: "📊",
    title: "Real-Time Tracking",
    description:
      "Monitor your ticket status from open to resolved. Get instant updates as your issue progresses through the pipeline.",
    color: "purple",
  },
  {
    icon: "📧",
    title: "Email Notifications",
    description:
      "Automatic emails when tickets are created and resolved. Stay informed without constantly checking the dashboard.",
    color: "emerald",
  },
  {
    icon: "👥",
    title: "Role-Based Access",
    description:
      "Employees, managers, and support staff each get a tailored experience with permissions that match their responsibilities.",
    color: "amber",
  },
  {
    icon: "💡",
    title: "Solution Posting",
    description:
      "IT and HR staff can post detailed solutions. Build a knowledge base that helps resolve similar issues faster.",
    color: "rose",
  },
  {
    icon: "⭐",
    title: "Feedback System",
    description:
      "Rate and review resolutions to help improve service quality. Your feedback drives continuous improvement.",
    color: "cyan",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
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
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="feature-heading text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete helpdesk solution designed for speed, clarity, and
            seamless collaboration between teams.
          </p>
        </div>

        <div className="feature-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className="feature-card group card-glow bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 ${colors.bg} border ${colors.border} rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
