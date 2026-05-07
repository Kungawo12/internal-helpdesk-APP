"use client";

import { useParams, useRouter } from "next/navigation";
import { useTicket } from "@/hooks/useTicket";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

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

  const [ticketComments, setTicketComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setTicketComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsPostingComment(false);
    }
  };

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
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-sm text-slate-500">The requested ticket could not be retrieved.</p>
        <button onClick={() => router.back()} className="btn-secondary">Return to Dashboard</button>
      </div>
    );
  }

  const role = session?.user?.role;
  const isCreator = session?.user?.email === ticket.creator.email;
  const isStaff = role === 'it_staff' || role === 'hr_staff';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>←</span> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
           <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
           <span className={`badge ${
             ticket.status === 'resolved' ? 'badge-green' : 
             ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'
           }`}>
             {ticket.status.replace("_", " ")}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           {/* Progress Stepper */}
           <div className="flex items-center justify-between max-w-lg mx-auto mb-10 mt-4 relative">
             <div className="absolute left-0 top-4 w-full h-1 bg-slate-200 z-0" />
             <div className={`absolute left-0 top-4 h-1 bg-blue-600 z-0 transition-all duration-500 ${ticket.status === 'resolved' ? 'w-full' : ticket.status === 'in_progress' ? 'w-1/2' : 'w-0'}`} />
             
             <div className="relative z-10 flex flex-col items-center gap-2">
               <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${ticket.status === 'open' ? 'border-blue-600 bg-white' : 'border-blue-600 bg-blue-600'}`}>
                 <div className={`w-2.5 h-2.5 rounded-full ${ticket.status === 'open' ? 'bg-blue-600' : 'bg-white'}`} />
               </div>
               <span className={`text-xs font-bold ${ticket.status === 'open' ? 'text-blue-600' : 'text-slate-900'}`}>Created</span>
             </div>
             
             <div className="relative z-10 flex flex-col items-center gap-2">
               <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${ticket.status === 'in_progress' ? 'border-blue-600 bg-white' : ticket.status === 'resolved' ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-slate-100'}`}>
                 <div className={`w-2.5 h-2.5 rounded-full ${ticket.status === 'in_progress' ? 'bg-blue-600' : ticket.status === 'resolved' ? 'bg-white' : 'bg-slate-300'}`} />
               </div>
               <span className={`text-xs font-bold ${ticket.status === 'in_progress' ? 'text-blue-600' : ticket.status === 'resolved' ? 'text-slate-900' : 'text-slate-400'}`}>In Progress</span>
             </div>
             
             <div className="relative z-10 flex flex-col items-center gap-2">
               <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${ticket.status === 'resolved' ? 'border-green-500 bg-white' : 'border-slate-200 bg-slate-100'}`}>
                 <div className={`w-2.5 h-2.5 rounded-full ${ticket.status === 'resolved' ? 'bg-green-500' : 'bg-slate-300'}`} />
               </div>
               <span className={`text-xs font-bold ${ticket.status === 'resolved' ? 'text-green-600' : 'text-slate-400'}`}>Resolved</span>
             </div>
           </div>
           <div className="card p-6">
              <div className="flex items-start gap-4 mb-6 border-b border-slate-100 pb-6">
                 <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl flex-shrink-0">
                    {ticket.type === 'IT' ? '💻' : '📋'}
                 </div>
                 <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{ticket.title}</h1>
                    <p className="text-xs text-slate-500 font-mono">ID: #{ticket.id.toUpperCase()}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-slate-900">Problem Description</h3>
                 <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {ticket.description}
                 </p>
              </div>
           </div>

           {/* Solution Panel */}
           {ticket.status === 'resolved' && (
             <div className="card p-6 bg-green-50/50 border-green-100">
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-green-600 text-lg">✅</span>
                   <h3 className="text-base font-bold text-green-900">Resolution Details</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-100 text-sm text-slate-700 leading-relaxed">
                   {ticket.solution}
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-green-700">
                   <span className="font-medium">Resolved by {ticket.assignee?.name}</span>
                   <span>•</span>
                   <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
             </div>
           )}

           {/* Resolve Action Panel (Staff Only) */}
           {isStaff && ticket.status !== 'resolved' && (
             <div className="card p-6 border-blue-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Submit Resolution</h3>
                <form onSubmit={handleResolve} className="space-y-4">
                   <textarea
                     required
                     placeholder="Document the solution applied to this request..."
                     value={solution}
                     onChange={(e) => setSolution(e.target.value)}
                     className="input-field min-h-[120px] resize-y"
                   />
                   <div className="flex gap-3">
                     <button 
                       type="submit" 
                       disabled={isSubmitting}
                       className="btn-primary flex-1"
                     >
                       {isSubmitting ? "Processing..." : "Resolve Ticket"}
                     </button>
                     {ticket.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange("in_progress")}
                          className="btn-secondary"
                        >
                          Start Working
                        </button>
                     )}
                   </div>
                </form>
             </div>
           )}

           {/* Comments Section */}
           <div className="card p-6 border-slate-200">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Discussion</h3>
             
             <div className="space-y-6 mb-6">
               {commentsLoading ? (
                 <div className="space-y-4">
                   <div className="flex gap-4 animate-pulse">
                     <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                     <div className="space-y-2 flex-1">
                       <div className="h-4 bg-slate-200 rounded w-1/4" />
                       <div className="h-16 bg-slate-200 rounded-lg w-3/4" />
                     </div>
                   </div>
                   <div className="flex gap-4 animate-pulse justify-end">
                     <div className="space-y-2 flex-1 items-end flex flex-col">
                       <div className="h-4 bg-slate-200 rounded w-1/4" />
                       <div className="h-16 bg-slate-200 rounded-lg w-3/4" />
                     </div>
                     <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                   </div>
                 </div>
               ) : ticketComments.length === 0 ? (
                 <div className="text-center py-8">
                   <p className="text-sm text-slate-500 italic">No messages yet. Be the first to comment.</p>
                 </div>
               ) : (
                 ticketComments.map((c) => {
                   const isMe = c.user?.email === session?.user?.email;
                   return (
                     <div key={c.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : ""}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isMe ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-600"}`}>
                         {c.user?.name?.charAt(0) || '?'}
                       </div>
                       <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                         <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                           <span className="font-bold text-sm text-slate-900">{isMe ? "You" : c.user?.name || 'Unknown User'}</span>
                           <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                         </div>
                         <p className={`text-sm p-3 rounded-2xl whitespace-pre-wrap ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm"}`}>
                           {c.content}
                         </p>
                       </div>
                     </div>
                   );
                 })
               )}
               <div ref={commentsEndRef} />
             </div>

             <form onSubmit={handlePostComment} className="flex gap-3 items-start border-t border-slate-100 pt-6 sticky bottom-0 bg-white z-10 pb-2">
               <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold flex-shrink-0">
                 {session?.user?.name?.charAt(0) || '?'}
               </div>
               <div className="flex-1 space-y-3">
                 <textarea
                   placeholder="Add a comment..."
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   className="input-field min-h-[80px] text-sm resize-y"
                   required
                 />
                 <div className="flex justify-end">
                   <button 
                     type="submit" 
                     disabled={isPostingComment || !newComment.trim()}
                     className="btn-primary"
                   >
                     {isPostingComment ? "Posting..." : "Post Comment"}
                   </button>
                 </div>
               </div>
             </form>
           </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
           <div className="card p-5 space-y-6">
              <div className="space-y-4">
                 <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Creator</p>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {ticket.creator.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-medium text-sm text-slate-900">{ticket.creator.name}</span>
                          <span className="text-xs text-slate-500">{ticket.creator.email}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                    <div>
                       <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Priority</p>
                       <p className={`font-medium text-sm ${
                         ticket.priority === 'urgent' ? 'text-red-600' : ticket.priority === 'high' ? 'text-orange-500' : ticket.priority === 'medium' ? 'text-blue-600' : 'text-slate-500'
                       }`}>{ticket.priority}</p>
                    </div>
                    <div>
                       <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Department</p>
                       <p className="font-medium text-sm text-slate-900">{ticket.type}</p>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Timeline</p>
                    <div className="space-y-3">
                       <div className="flex gap-3">
                          <div className="w-0.5 bg-blue-200 mt-1" />
                          <div>
                             <p className="text-xs font-medium text-slate-900">Created</p>
                             <p className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</p>
                          </div>
                       </div>
                       {ticket.status === 'resolved' && (
                         <div className="flex gap-3">
                            <div className="w-0.5 bg-green-200 mt-1" />
                            <div>
                               <p className="text-xs font-medium text-green-700">Resolved</p>
                               <p className="text-xs text-slate-500">{new Date(ticket.updatedAt).toLocaleString()}</p>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Feedback System (Creator Only) */}
           {isCreator && ticket.status === 'resolved' && !ticket.feedback && (
             <div className="card p-5 border-blue-100">
                <h3 className="text-base font-bold text-slate-900 mb-4">Rate your support</h3>
                <form onSubmit={handleFeedback} className="space-y-4">
                   <div className="space-y-2">
                      <div className="flex items-center gap-1">
                         {[1,2,3,4,5].map(s => (
                           <button 
                             key={s} 
                             type="button" 
                             onClick={() => setRating(s)}
                             className={`text-2xl transition-colors ${
                               rating >= s ? "text-amber-400" : "text-slate-200 hover:text-slate-300"
                             }`}
                           >
                             ★
                           </button>
                         ))}
                      </div>
                   </div>
                   <textarea
                     placeholder="Any comments on the resolution?"
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     className="input-field min-h-[80px] text-sm"
                   />
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="btn-primary w-full"
                   >
                     {isSubmitting ? "Submitting..." : "Send Feedback"}
                   </button>
                </form>
             </div>
           )}

           {/* Feedback View */}
           {ticket.feedback && (
             <div className="card p-5 bg-amber-50/50 border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Feedback Provided</p>
                <div className="flex items-center gap-1 mb-3">
                   {[1,2,3,4,5].map(s => (
                     <span key={s} className={`text-xl ${ticket.feedback!.rating >= s ? "text-amber-400" : "text-slate-200"}`}>★</span>
                   ))}
                </div>
                {ticket.feedback.comment && (
                  <p className="text-sm text-slate-700 italic border-l-2 border-amber-300 pl-3">
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
