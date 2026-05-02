"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  solution: string | null;
  createdAt: string;
  feedback?: {
    rating: number;
    comment: string | null;
  } | null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-subtle text-sm font-medium">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Tickets</h1>
          <p className="text-subtle mt-1">Track and manage your active requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          Create New Ticket
        </Link>
      </div>

      <div className="space-y-6">
        {tickets.map((ticket) => (
          <Link 
            key={ticket.id} 
            href={`/dashboard/ticket/${ticket.id}`}
            className="block group"
          >
            <div className="card p-6 md:p-8 hover:border-primary/40 transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`badge ${
                      ticket.priority === 'urgent' ? 'badge-red' : 
                      ticket.priority === 'high' ? 'badge-red' : 
                      'badge-blue'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`badge ${
                      ticket.status === 'resolved' ? 'badge-green' : 'badge-gray'
                    }`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-medium text-slate-600">ID: {ticket.id.slice(0, 8)}</span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{ticket.title}</h2>
                  <p className="text-subtle text-sm leading-relaxed mb-6 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-6 text-[12px] font-medium text-slate-500">
                     <span>Opened on {new Date(ticket.createdAt).toLocaleDateString()}</span>
                     <div className="w-1 h-1 bg-slate-800 rounded-full" />
                     <span>Type: {ticket.type}</span>
                  </div>
                </div>

                <div className="md:w-72">
                  {ticket.status === "resolved" && (
                    <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/10">
                      <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Resolution</h3>
                      <p className="text-sm text-slate-300 italic mb-2 line-clamp-2">"{ticket.solution}"</p>
                      
                      {ticket.feedback ? (
                        <div className="flex items-center gap-2">
                          <div className="flex text-yellow-500 text-[10px]">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < ticket.feedback!.rating ? "opacity-100" : "opacity-20"}>★</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-primary uppercase">Needs Feedback</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {tickets.length === 0 && (
          <div className="card p-20 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-subtle font-medium">You haven't created any tickets yet.</p>
            <Link href="/dashboard/create" className="text-primary hover:underline mt-2 inline-block font-bold">
              Create your first ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
