"use client";

import { useState, useEffect } from "react";
import { getLatestComms } from "@/app/actions/comms";

export function useComms() {
  const [latestComms, setLatestComms] = useState<{ date: string; content: string; hash: string } | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    async function checkComms() {
      const comms = await getLatestComms();
      if (!comms) return;

      const lastSeenHash = localStorage.getItem("last_seen_comms_hash");
      
      if (comms.hash !== lastSeenHash) {
        setHasNewMessage(true);
      }
      
      setLatestComms(comms);
    }

    checkComms();
    // Poll every 60 seconds
    const interval = setInterval(checkComms, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = () => {
    if (latestComms) {
      localStorage.setItem("last_seen_comms_hash", latestComms.hash);
      setHasNewMessage(false);
    }
  };

  return { latestComms, hasNewMessage, markAsRead };
}
