"use client";

const features = [
  {
    title: "Smart Triage",
    desc: "Automatically categorize and route incoming tickets to the right department using built-in logic.",
    icon: "🧠"
  },
  {
    title: "SLA Tracking",
    desc: "Keep your response times fast with visual priority indicators and service level monitoring.",
    icon: "⏳"
  },
  {
    title: "Manager Insights",
    desc: "Get a bird's-eye view of your company's operational health with real-time analytics.",
    icon: "📊"
  },
  {
    title: "Role-Based Access",
    desc: "Seamless experience for employees, managers, and support staff with tailored interfaces.",
    icon: "📡"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative bg-bg-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Everything you need to <br />
            <span className="text-primary">manage internal requests.</span>
          </h2>
          <p className="text-lg text-subtle max-w-2xl mx-auto">
            A powerful set of tools designed to help IT and HR departments 
            handle employee needs without the complexity of traditional software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="card p-8 group hover:translate-y-[-4px]"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-primary/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                {f.title}
              </h3>
              <p className="text-subtle text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
