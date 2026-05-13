"use client";

import React from "react";

interface SlaBadgeProps {
  ticket: {
    slaResolutionDue: string | null;
    slaBreached: boolean;
    status: string;
  };
}

export default function SlaBadge({ ticket }: SlaBadgeProps) {
  if (ticket.status === "resolved" || !ticket.slaResolutionDue) return null;
  
  // eslint-disable-next-line react-hooks/purity
  const diff = new Date(ticket.slaResolutionDue).getTime() - Date.now();
  const breached = ticket.slaBreached || diff < 0;
  const atRisk = !breached && diff < 60 * 60 * 1000; // < 1 hour
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const label = breached ? "Breached" : hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  
  const cls = breached
    ? "bg-red-50 text-red-700 border border-red-200   "
    : atRisk
    ? "bg-amber-50 text-amber-700 border border-amber-200   "
    : "bg-emerald-50 text-emerald-700 border border-emerald-200   ";
    
  const title = breached
    ? "SLA Breached: this ticket is past its resolution deadline"
    : atRisk
    ? "SLA At Risk: resolution deadline is within 1 hour"
    : "On Track: within SLA deadline";

  return (
    <span 
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}
      title={title}
    >
      {label}
    </span>
  );
}
