"use client";

const stats = [
  { value: "99.9%", label: "System Uptime" },
  { value: "< 2h", label: "Resolution Time" },
  { value: "12k+", label: "Tasks Logged" },
  { value: "4.9/5", label: "User Sat" },
];

const roles = [
  {
    title: "Employees",
    description: "Submit request protocols and track progress through a tactical unified portal.",
    capabilities: ["Protocol Initiation", "Live Status Tracking", "Intelligent Archives"],
  },
  {
    title: "Managers",
    description: "Full oversight of team metrics and departmental strategic performance.",
    capabilities: ["Global Insight Hub", "Domain Filtering", "SLA Monitoring"],
  },
  {
    title: "Support Ops",
    description: "Powerful tools for technical experts to resolve high-priority requests fast.",
    capabilities: ["Tactical Queue Control", "Resolution Logging", "System Alerts"],
  },
];

export default function StatsSection() {
  return (
    <section id="enterprise" className="py-40 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />

      {/* Strategic Metrics */}
      <div className="max-w-7xl mx-auto px-8 mb-40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
              <div className="w-8 h-1 bg-primary/20 mx-auto mt-6 rounded-full group-hover:w-16 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Role Ecosystem */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-morphism mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Operational Ecosystem</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase text-white leading-tight">
            Tailored for the <br />
            <span className="text-primary italic">Entire Infrastructure.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            One platform, three specialized operational interfaces designed for specific mission objectives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {roles.map((role) => (
            <div
              key={role.title}
              className="card p-12 flex flex-col group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-3xl font-black mb-6 text-white uppercase tracking-tight">{role.title}</h3>
              <p className="text-slate-400 mb-10 text-lg leading-relaxed font-medium">
                {role.description}
              </p>
              
              <ul className="space-y-4 mt-auto pt-8 border-t border-white/5 relative z-10">
                {role.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-center gap-4 text-sm font-black text-slate-500 uppercase tracking-widest group/item"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover/item:scale-150 transition-transform" />
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
