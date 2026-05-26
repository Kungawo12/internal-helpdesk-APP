"use client";

import { useState, useEffect, useCallback } from "react";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  solution: string | null;
  slaResolutionDue: string | null;
  slaFirstResponseDue: string | null;
  slaBreached: boolean;
  slaFirstResponseMet: boolean;
  category: string | null;
  softwareName: string | null;
  affectedSystem: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: { name: string; email: string };
  assignee: { name: string; email: string } | null;
  feedback?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
};

export function useTicket(id: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async (isInitial = false) => {
    try {
      // Only show the full loading spinner on the initial fetch, not on background polls.
      // Setting loading=true on every poll would unmount the entire detail view every 30s.
      if (isInitial) setLoading(true);
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Failed to load ticket");
      const data = await res.json();
      setTicket(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchTicket(true);
    const interval = setInterval(() => { if (id) fetchTicket(false); }, 30000);
    return () => clearInterval(interval);
  }, [id, fetchTicket]);

  return { ticket, loading, error, refresh: fetchTicket };
}
