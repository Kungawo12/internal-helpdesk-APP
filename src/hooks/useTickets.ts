"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket } from "./useTicket";

export function useTickets(filters?: {
  status?: string;
  type?: string;
  priority?: string;
  q?: string;
}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      let url = "/api/tickets";
      if (filters) {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== "all") params.append("status", filters.status);
        if (filters.type && filters.type !== "all") params.append("type", filters.type);
        if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
        if (filters.q) params.append("q", filters.q);

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch operational manifest");
      const data = await res.json();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Critical protocol failure");
    } finally {
      setInitialLoading(false);
    }
  }, [filters?.status, filters?.type, filters?.priority, filters?.q]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  return { tickets, loading: initialLoading, error, refresh: fetchTickets };
}
