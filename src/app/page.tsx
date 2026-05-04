import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] px-6">
        <div className="max-w-6xl mx-auto w-full h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center font-bold text-white text-lg">
              H
            </div>
            <span className="font-bold text-xl text-[#0f172a]">Helpdesk</span>
          </Link>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-[#475569] hover:text-[#0f172a] transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-xs font-semibold mb-8">
              Internal Support Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-[#0f172a]">
              Get Help. Stay Productive.
            </h1>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto mb-10 leading-relaxed">
              Submit IT and HR support tickets, track their status, and get solutions fast so you can get back to work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base px-8 py-3">
                Get Started
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-3">
                Sign In
              </Link>
            </div>

            {/* Dashboard Mockup */}
            <div className="mt-20 max-w-5xl mx-auto bg-white rounded-xl border border-[#e2e8f0] shadow-xl overflow-hidden">
              <div className="h-10 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]" />
              </div>
              <div className="p-8 grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]" />)}
                <div className="col-span-4 h-64 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] mt-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-white border-y border-[#e2e8f0]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
              <p className="text-[#475569]">A professional helpdesk to manage all internal support requests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Quick Ticketing", desc: "Submit issues in seconds with intuitive forms.", icon: "🎫" },
                { title: "Real-Time Tracking", desc: "Know exactly where your ticket stands.", icon: "⏱️" },
                { title: "Email Alerts", desc: "Get notified when your issue is resolved.", icon: "📧" },
                { title: "Role-Based Access", desc: "Secure views for staff, managers, and employees.", icon: "🔐" },
                { title: "Solution Database", desc: "Store resolutions to common problems.", icon: "📚" },
                { title: "Feedback System", desc: "Rate the support you received.", icon: "⭐" },
              ].map((f, i) => (
                <div key={i} className="card p-6">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[#475569]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How it works</h2>
              <p className="text-[#475569]">Four simple steps to resolution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Submit a ticket", desc: "Describe your IT or HR issue." },
                { step: "2", title: "Team gets notified", desc: "The right department is alerted." },
                { step: "3", title: "Issue resolved", desc: "Staff provides a clear solution." },
                { step: "4", title: "Give feedback", desc: "Rate your experience." },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-[#eff6ff] text-[#2563eb] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4 border border-[#bfdbfe]">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-[#475569]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-20 px-6 bg-white border-y border-[#e2e8f0]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Built for every role</h2>
              <p className="text-[#475569]">Different views tailored to what each person needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-8">
                <h3 className="text-xl font-bold mb-4">Employees</h3>
                <ul className="space-y-3 text-sm text-[#475569]">
                  <li className="flex items-center gap-2">✓ Submit IT and HR tickets</li>
                  <li className="flex items-center gap-2">✓ Track status and updates</li>
                  <li className="flex items-center gap-2">✓ Provide resolution feedback</li>
                </ul>
              </div>
              <div className="card p-8 border-t-4 border-t-[#2563eb]">
                <h3 className="text-xl font-bold mb-4">IT & HR Staff</h3>
                <ul className="space-y-3 text-sm text-[#475569]">
                  <li className="flex items-center gap-2">✓ Dedicated ticket queue</li>
                  <li className="flex items-center gap-2">✓ Department isolation</li>
                  <li className="flex items-center gap-2">✓ One-click resolution tools</li>
                </ul>
              </div>
              <div className="card p-8">
                <h3 className="text-xl font-bold mb-4">Managers</h3>
                <ul className="space-y-3 text-sm text-[#475569]">
                  <li className="flex items-center gap-2">✓ Company-wide overview</li>
                  <li className="flex items-center gap-2">✓ Department performance stats</li>
                  <li className="flex items-center gap-2">✓ Search and filter all tickets</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-[#e2e8f0] text-center bg-white">
         <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-[#0f172a] mb-6">Ready to get started?</h3>
            <Link href="/register" className="btn-primary px-8 py-3 mb-12">Register Now</Link>
            <p className="text-sm text-[#475569]">© 2024 Helpdesk Platform. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
