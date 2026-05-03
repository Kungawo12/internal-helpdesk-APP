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
    description: "Submit help requests and track progress through a simple, unified portal.",
    capabilities: ["Create Tickets", "Track Status", "View Resolution"],
  },
  {
    title: "Managers",
    description: "Full oversight of team performance and company-wide helpdesk metrics.",
    capabilities: ["Team Dashboard", "Department Filtering", "SLA Reports"],
  },
  {
    title: "Support Staff",
    description: "Powerful tools for technical teams to resolve requests fast and efficiently.",
    capabilities: ["Ticket Queue", "Solution Logging", "Email Alerts"],
  },
];

export default function StatsSection() {
  return (
    <section id="enterprise" className="py-40 relative overflow-hidden">

      {/* Metrics */}
      <div className="max-w-6xl mx-auto px-8 mb-40">
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

      {/* Roles */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Simple & Powerful</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter text-white leading-tight">
            Designed for your <br />
            <span className="text-primary">Entire Team.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            One platform, three specialized interfaces designed for specific user needs.
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
