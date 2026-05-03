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

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ticket protocols");
      const data = await res.json();
      setTicket(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Critical protocol failure");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchTicket();
  }, [id, fetchTicket]);

  return { ticket, loading, error, refresh: fetchTicket };
}
