export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* CTA Section */}
        <div className="text-center mb-16 py-16 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-white/[0.06]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
            Join your team on the helpdesk and get your issues resolved faster
            than ever.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            Create Your Account
            <span>&rarr;</span>
          </a>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-xs font-bold">
              H
            </div>
            <span className="font-medium text-slate-400">
              Internal Helpdesk
            </span>
          </div>
          <p>&copy; {new Date().getFullYear()} Internal Helpdesk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
