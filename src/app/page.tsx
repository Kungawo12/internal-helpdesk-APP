export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl font-bold">
            H
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Internal Helpdesk
          </h1>
        </div>

        <p className="max-w-md text-lg text-slate-300 leading-relaxed">
          Submit IT and HR support tickets, track their status, and get
          solutions — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-56">
            <div className="text-3xl">🖥️</div>
            <h3 className="font-semibold text-lg">IT Support</h3>
            <p className="text-sm text-slate-400">
              Computer, software, and network issues
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-56">
            <div className="text-3xl">👥</div>
            <h3 className="font-semibold text-lg">HR Support</h3>
            <p className="text-sm text-slate-400">
              Wages, holidays, and HR-related queries
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/login"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-semibold transition-colors"
          >
            Sign In
          </a>
          <a
            href="/login"
            className="px-8 py-3 border border-white/20 hover:bg-white/10 rounded-full font-semibold transition-colors"
          >
            Create Account
          </a>
        </div>

        <p className="text-sm text-slate-500 mt-8">
          Employees · Managers · IT & HR Staff
        </p>
      </main>
    </div>
  );
}
