"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BuyTicketButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/tickets/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result?.error ?? "Unable to buy ticket.");
        setLoading(false);
        return;
      }

      setMessage("Ticket purchased successfully.");
      setLoading(false);
    } catch {
      setMessage("Unable to buy ticket.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button className="rounded-xl" onClick={handleBuy} disabled={loading}>
        {loading ? "Buying..." : "Buy Ticket"}
      </Button>
      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
