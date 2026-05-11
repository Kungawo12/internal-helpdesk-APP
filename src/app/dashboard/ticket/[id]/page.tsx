"use client";

import { useParams, useRouter } from "next/navigation";
import { useTicket } from "@/hooks/useTicket";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import AiCopilotPanel from "@/components/tickets/AiCopilotPanel";

function SlaBadge({ ticket }: { ticket: { slaResolutionDue: string | null; slaBreached: boolean; status: string } }) {
  if (ticket.status === "resolved" || !ticket.slaResolutionDue) return null;
  const diff = new Date(ticket.slaResolutionDue).getTime() - Date.now();
  const breached = ticket.slaBreached || diff < 0;
  const atRisk = !breached && diff < 60 * 60 * 1000; // < 1 hour
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const label = breached ? "Breached" : hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  const cls = breached
    ? "bg-red-50 text-red-700 border border-red-200"
    : atRisk
    ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

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
  const [isInternal, setIsInternal] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchAttachments = async () => {
    const res = await fetch(`/api/tickets/${id}/attachments`);
    if (res.ok) setAttachments(await res.json());
  };

  useEffect(() => { if (id) fetchAttachments(); }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/tickets/${id}/attachments`, { method: "POST", body: form });
    if (res.ok) {
      await fetchAttachments();
    } else {
      const d = await res.json();
      setUploadError(d.error || "Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  };

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

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}/audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
      fetchAuditLogs();
    }
  }, [id]);

  const timeline = useMemo(() => {
    const items = [
      ...ticketComments.map(c => ({ ...c, timelineType: 'comment' })),
      ...auditLogs.map(a => ({ ...a, timelineType: 'audit' }))
    ];
    return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [ticketComments, auditLogs]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/tickets/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, isInternal }),
      });
      if (res.ok) {
        setNewComment("");
        setIsInternal(false);
        await fetchComments();
        await fetchAuditLogs();
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

  const handleEscalate = async () => {
    setEscalating(true);
    await fetch(`/api/tickets/${id}/escalate`, { method: "PATCH" });
    refresh();
    setEscalating(false);
  };

  const handleReopen = async () => {
    setReopening(true);
    await fetch(`/api/tickets/${id}/reopen`, { method: "PATCH" });
    refresh();
    setReopening(false);
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

              {/* IT-specific detail fields */}
              {ticket.type === 'IT' && (ticket.category || ticket.softwareName || ticket.affectedSystem || ticket.errorMessage) && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Software Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {ticket.category && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">{ticket.category}</span>
                      </div>
                    )}
                    {ticket.affectedSystem && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Platform</p>
                        <p className="text-sm font-semibold text-slate-700">{ticket.affectedSystem}</p>
                      </div>
                    )}
                    {ticket.softwareName && (
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Affected Software</p>
                        <p className="text-sm font-semibold text-slate-700">{ticket.softwareName}</p>
                      </div>
                    )}
                  </div>
                  {ticket.errorMessage && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Error Message</p>
                      <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-mono overflow-x-auto">{ticket.errorMessage}</pre>
                    </div>
                  )}
                </div>
              )}
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

           {/* Attachments Section */}
           <div className="card p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-slate-900">Attachments</h3>
               <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                 {uploading ? "Uploading..." : "＋ Attach File"}
                 <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}
                   accept="image/*,.pdf,.txt,.doc,.docx,.xlsx" />
               </label>
             </div>

             {uploadError && <p className="text-sm text-red-500 mb-3">{uploadError}</p>}

             {attachments.length === 0 ? (
               <p className="text-sm text-slate-400 italic">No attachments yet.</p>
             ) : (
               <div className="space-y-2">
                 {attachments.map(a => (
                   <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group">
                     <span className="text-2xl">{a.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "🖼️" : a.filename.match(/\.pdf$/i) ? "📄" : "📎"}</span>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">{a.filename}</p>
                       <p className="text-xs text-slate-400">{(a.size / 1024).toFixed(1)} KB · {a.uploadedBy?.name} · {new Date(a.createdAt).toLocaleDateString()}</p>
                     </div>
                     <span className="text-slate-400 group-hover:text-blue-600 text-xs font-bold">↗</span>
                   </a>
                 ))}
               </div>
             )}
           </div>

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
               ) : timeline.length === 0 ? (
                 <div className="text-center py-8">
                   <p className="text-sm text-slate-500 italic">No messages yet. Be the first to comment.</p>
                 </div>
               ) : (
                 timeline.map((item) => {
                      if (item.timelineType === 'comment') {
                        const isMe = item.user?.email === session?.user?.email;
                        const isInternal = item.isInternal;
                        return (
                          <div key={item.id} className={`flex gap-4 ${isMe ? "flex-row-reverse" : ""}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isMe ? "bg-slate-900 text-white" : "bg-blue-100 text-blue-600"}`}>
                              {item.user?.name?.charAt(0) || '?'}
                            </div>
                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                              <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
                                <span className="font-bold text-sm text-slate-900">{isMe ? "You" : item.user?.name || 'Unknown User'}</span>
                                <span className="text-xs text-slate-500">{timeAgo(item.createdAt)}</span>
                                {isInternal && <span className="text-xs text-amber-600 font-bold">🔒 Staff Only</span>}
                              </div>
                              <p className={`text-sm p-3 rounded-2xl whitespace-pre-wrap ${
                                isInternal ? "bg-amber-50 text-amber-800 border border-amber-200" :
                                isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm"
                              }`}>
                                {item.content}
                              </p>
                            </div>
                          </div>
                        );
                      } else {
                        const actionLabels: Record<string, string> = {
                          CREATED: "raised this ticket",
                          STATUS_CHANGED: `changed status from ${item.oldValue} → ${item.newValue}`,
                          ASSIGNED: `assigned to ${item.newValue}`,
                          UNASSIGNED: "removed assignee",
                          RESOLVED: "resolved this ticket",
                          COMMENT_ADDED: "left a comment",
                          INTERNAL_NOTE: "added an internal note",
                          SLA_BREACHED: "SLA deadline breached",
                        };
                        const icons: Record<string, string> = {
                          CREATED: "🟢",
                          STATUS_CHANGED: "🔵",
                          ASSIGNED: "👤",
                          UNASSIGNED: "👤",
                          RESOLVED: "✅",
                          COMMENT_ADDED: "💬",
                          INTERNAL_NOTE: "🔒",
                          SLA_BREACHED: "🔴",
                        };
                        return (
                          <div key={item.id} className="flex gap-4 items-center text-sm text-slate-500">
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-lg">
                              {icons[item.action] || "ℹ️"}
                            </div>
                            <div className="flex-1">
                              <span className="font-bold text-slate-700">{item.user?.name}</span>{" "}
                              {actionLabels[item.action] || item.action}{" "}
                              <span className="text-xs text-slate-400">· {timeAgo(item.createdAt)}</span>
                            </div>
                          </div>
                        );
                      }
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
                   className={`input-field min-h-[80px] text-sm resize-y ${isInternal ? "bg-amber-50 border-amber-200" : ""}`}
                   required
                 />
                 <div className="flex justify-between items-center">
                   {isStaff && (
                     <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                       <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                       <span>🔒 Internal note</span>
                     </label>
                   )}
                   <div className="flex justify-end flex-1">
                     <button 
                       type="submit" 
                       disabled={isPostingComment || !newComment.trim()}
                       className="btn-primary"
                     >
                       {isPostingComment ? "Posting..." : "Post Comment"}
                     </button>
                   </div>
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

                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Assignee</p>
                    {ticket.assignee ? (
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                             {ticket.assignee.name.charAt(0)}
                          </div>
                          <div>
                             <span className="font-medium text-sm text-slate-900 block">{ticket.assignee.name}</span>
                             <span className="text-xs text-slate-500">{ticket.assignee.email}</span>
                          </div>
                       </div>
                    ) : (
                       <span className="badge badge-slate">Unassigned</span>
                    )}
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

                  {(isStaff || role === 'admin') && ticket.priority !== 'urgent' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={handleEscalate}
                        disabled={escalating}
                        className="w-full py-2.5 px-4 rounded-xl border-2 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 text-sm font-bold transition-all"
                      >
                        {escalating ? "Escalating..." : "⬆ Escalate Priority"}
                      </button>
                      <p className="text-xs text-slate-400 text-center mt-1.5">
                        Current: <span className="font-bold capitalize">{ticket.priority}</span> → next level up
                      </p>
                    </div>
                  )}

                  {(isStaff || role === 'admin') && (
                    <AiCopilotPanel ticketId={id} />
                  )}

                 {ticket.slaResolutionDue && ticket.status !== "resolved" && (
                   <div className="pt-4 border-t border-slate-100">
                     <p className="text-xs font-semibold text-slate-500 uppercase mb-2">SLA</p>
                     <SlaBadge ticket={ticket} />
                     <p className="text-xs text-slate-400 mt-1">
                       Due: {new Date(ticket.slaResolutionDue).toLocaleString()}
                     </p>
                   </div>
                 )}
                 {ticket.status === "resolved" && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">SLA</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.slaBreached ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {ticket.slaBreached ? "⚠ Resolved after breach" : "✓ Resolved within SLA"}
                      </span>
                    </div>
                  )}

                  {isCreator && (ticket.status === 'resolved' || ticket.status === 'closed') && (
                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={handleReopen}
                        disabled={reopening}
                        className="btn-secondary w-full text-sm"
                      >
                        {reopening ? "Reopening..." : "↩ Reopen Ticket"}
                      </button>
                      <p className="text-xs text-slate-400 text-center mt-2">Issue not resolved? Reopen to submit again.</p>
                    </div>
                  )}

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
