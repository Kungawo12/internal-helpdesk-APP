"use client";

import { useParams, useRouter } from "next/navigation";
import { useTicket } from "@/hooks/useTicket";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const { ticket, loading, error, refresh } = useTicket(id);

  const [solution, setSolution] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && ticket) {
      gsap.from(".prism-reveal", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });
    }
  }, [loading, ticket]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/tickets/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solution, status: "resolved" }),
      });
      setSolution("");
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/tickets/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`/api/tickets/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || null }),
      });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-[3px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Data Stream</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="glass-panel p-12 space-y-6">
           <div className="text-6xl">⚠️</div>
           <h2 className="text-3xl font-extrabold text-[#0f172a]">Access Denied</h2>
           <p className="text-slate-500 font-medium">The requested record could not be retrieved from the manifest.</p>
           <button onClick={() => router.back()} className="btn-prism">Return to Manifest</button>
        </div>
      </div>
    );
  }

  const role = session?.user?.role;
  const isCreator = session?.user?.email === ticket.creator.email;
  const isStaff = role === 'it_staff' || role === 'hr_staff';

  return (
    <div className="space-y-10 pb-20">
      {/* Prism Navigation */}
      <div className="prism-reveal flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-black text-[#0f172a] hover:gap-4 transition-all uppercase tracking-widest"
        >
          <span>←</span> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket_Status:</span>
           <span className={`badge-prism ${
             ticket.status === 'resolved' ? 'badge-green' : 
             ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
           }`}>
             {ticket.status.replace("_", " ")}
           </span>
        </div>
      </div>

      {/* Ticket Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
           <div className="prism-reveal glass-panel p-10 bg-white shadow-2xl border-white/80">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-inner">
                    {ticket.type === 'IT' ? '💻' : '📋'}
                 </div>
                 <div>
                    <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight mb-1">{ticket.title}</h1>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global_ID: #{ticket.id.toUpperCase()}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Problem Description</h3>
                 <p className="text-lg text-[#475569] leading-relaxed font-medium whitespace-pre-wrap">
                    {ticket.description}
                 </p>
              </div>
           </div>

           {/* Solution Panel */}
           {ticket.status === 'resolved' && (
             <div className="prism-reveal glass-panel p-10 bg-emerald-50/20 border-emerald-100 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xl">✅</div>
                   <h3 className="text-xl font-extrabold text-emerald-900 tracking-tight">Resolution Details</h3>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 border border-emerald-100 text-[#475569] font-medium leading-relaxed italic">
                   {ticket.solution}
                </div>
                <div className="mt-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase border border-emerald-200">
                      {ticket.assignee?.name?.charAt(0)}
                   </div>
                   <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Finalized by {ticket.assignee?.name} • {new Date(ticket.updatedAt).toLocaleDateString()}
                   </div>
                </div>
             </div>
           )}

           {/* Resolve Action Panel (Staff Only) */}
           {isStaff && ticket.status !== 'resolved' && (
             <div className="prism-reveal glass-panel p-10 bg-white border-blue-100 shadow-2xl">
                <h3 className="text-xl font-extrabold text-[#0f172a] tracking-tight mb-6">Submit Resolution</h3>
                <form onSubmit={handleResolve} className="space-y-6">
                   <textarea
                     required
                     placeholder="Document the technical solution applied to this request..."
                     value={solution}
                     onChange={(e) => setSolution(e.target.value)}
                     className="input-prism w-full min-h-[160px] resize-none text-base"
                   />
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="btn-prism w-full h-14 text-lg"
                   >
                     {isSubmitting ? "Processing..." : "Finalize Support Stream"}
                   </button>
                </form>
             </div>
           )}
        </div>

        {/* Sidebar Analytics/Meta Area */}
        <div className="space-y-8">
           {/* Meta Info */}
           <div className="prism-reveal glass-panel p-8 bg-white/40 space-y-8">
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Originator</p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 shadow-sm">
                          {ticket.creator.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-extrabold text-[#0f172a]">{ticket.creator.name}</span>
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{ticket.creator.email}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                       <p className={`font-black uppercase text-xs ${
                         ticket.priority === 'urgent' ? 'text-red-500' : 'text-[#0f172a]'
                       }`}>{ticket.priority}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                       <p className="font-black uppercase text-xs text-[#0f172a]">{ticket.type}</p>
                    </div>
                 </div>

                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Timeline_Log</p>
                    <div className="space-y-4">
                       <div className="flex gap-4">
                          <div className="w-1 bg-blue-100 rounded-full" />
                          <div>
                             <p className="text-xs font-extrabold text-[#0f172a]">Initialized</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(ticket.createdAt).toLocaleString()}</p>
                          </div>
                       </div>
                       {ticket.status === 'resolved' && (
                         <div className="flex gap-4">
                            <div className="w-1 bg-emerald-500 rounded-full" />
                            <div>
                               <p className="text-xs font-extrabold text-emerald-600">Finalized</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(ticket.updatedAt).toLocaleString()}</p>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Feedback System (Creator Only) */}
           {isCreator && ticket.status === 'resolved' && !ticket.feedback && (
             <div className="prism-reveal glass-panel p-8 bg-blue-50/30 border-blue-100 shadow-2xl">
                <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight mb-6">Service Feedback</h3>
                <form onSubmit={handleFeedback} className="space-y-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality_Rating</p>
                      <div className="flex items-center gap-2">
                         {[1,2,3,4,5].map(s => (
                           <button 
                             key={s} 
                             type="button" 
                             onClick={() => setRating(s)}
                             className={`w-10 h-10 rounded-xl font-black transition-all ${
                               rating >= s ? "bg-amber-400 text-white shadow-lg" : "bg-white text-slate-300 border border-slate-100"
                             }`}
                           >
                             {s}
                           </button>
                         ))}
                      </div>
                   </div>
                   <textarea
                     placeholder="Optional comments on resolution quality..."
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     className="input-prism w-full min-h-[100px] text-sm bg-white"
                   />
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="btn-prism w-full !bg-blue-600 shadow-blue-500/20"
                   >
                     {isSubmitting ? "Submitting..." : "Send Feedback"}
                   </button>
                </form>
             </div>
           )}

           {/* Feedback View */}
           {ticket.feedback && (
             <div className="prism-reveal glass-panel p-8 bg-amber-50/20 border-amber-100 shadow-lg">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Employee_Sentiment</p>
                <div className="flex items-center gap-1 mb-4">
                   {[1,2,3,4,5].map(s => (
                     <span key={s} className={`text-xl ${ticket.feedback!.rating >= s ? "text-amber-400" : "text-slate-200"}`}>★</span>
                   ))}
                </div>
                {ticket.feedback.comment && (
                  <p className="text-sm font-medium text-[#475569] leading-relaxed italic border-l-2 border-amber-200 pl-4">
                    "{ticket.feedback.comment}"
                  </p>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
