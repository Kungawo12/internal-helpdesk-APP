"use client";

const stats = [
  { value: "99.9%", label: "Uptime Stability" },
  { value: "< 2h", label: "Avg Resolution" },
  { value: "12k+", label: "Tasks Completed" },
  { value: "4.9/5", label: "Satisfaction Rate" },
];

const roles = [
  {
    title: "Employees",
    description: "Submit requests and track progress through a clean, unified portal.",
    capabilities: ["Easy Ticket Creation", "Live Progress Updates", "Solution Database"],
  },
  {
    title: "Managers",
    description: "Full oversight of team metrics and departmental performance.",
    capabilities: ["Global Metrics Hub", "Department Filters", "SLA Monitoring"],
  },
  {
    title: "Support Staff",
    description: "Powerful tools for IT and HR experts to resolve issues fast.",
    capabilities: ["Smart Queue Control", "Resolution Logging", "Team Alerts"],
  },
];

export default function StatsSection() {
  return (
    <section id="enterprise" className="py-32 bg-slate-950/50">
      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-subtle uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Ecosystem */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Tailored for your entire team</h2>
          <p className="text-lg text-subtle max-w-2xl mx-auto">
            One platform, three specialized experiences designed for specific operational needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className="card p-10 flex flex-col"
            >
              <h3 className="text-2xl font-bold mb-4 text-white">{role.title}</h3>
              <p className="text-subtle mb-8 text-base">
                {role.description}
              </p>
              
              <ul className="space-y-4 mt-auto pt-6 border-t border-white/5">
                {role.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
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
