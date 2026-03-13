"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, formatCurrency } from "@/lib/utils";

type TicketOption = {
  type: string;
  label: string;
  price: number;
  available: number;
};

export function BuyTicketButton({
  eventId,
  ticketOptions,
  hasPurchased = false,
}: {
  eventId: string;
  ticketOptions: TicketOption[];
  hasPurchased?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [purchased, setPurchased] = useState(hasPurchased);
  const [selectedType, setSelectedType] = useState<string>(
    ticketOptions[0]?.type ?? "",
  );

  const handleBuy = async () => {
    if (!selectedType) {
      setMessage("Please select a ticket type.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/tickets/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, ticketType: selectedType }),
      });

      const result = await response.json();
      if (!response.ok) {
        setMessage(result?.error ?? "Unable to buy ticket.");
        setLoading(false);
        return;
      }

      setMessage("Ticket purchased successfully.");
      setPurchased(true);
      setOpen(false);
      setLoading(false);
    } catch {
      setMessage("Unable to buy ticket.");
      setLoading(false);
    }
  };

  const hasTicketOptions = ticketOptions.length > 0;
  const buyDisabled = purchased || !hasTicketOptions || loading;
  const buyLabel = purchased ? "Ticket purchased" : "Buy Ticket";

  return (
    <div className="flex flex-col items-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<Button className="rounded-xl" disabled={buyDisabled} />}
        >
          {buyLabel}
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Select ticket type</DialogTitle>
            <DialogDescription>
              Choose the ticket you want to buy before confirming the purchase.
            </DialogDescription>
          </DialogHeader>

          {hasTicketOptions ? (
            <div className="space-y-3">
              {ticketOptions.map((option) => {
                const active = selectedType === option.type;

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedType(option.type)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border/50 bg-background hover:border-primary/40",
                    )}
                  >
                    <div>
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {option.available} available
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {option.price === 0
                        ? "Free"
                        : formatCurrency(option.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tickets available for this event.
            </p>
          )}

          <DialogFooter>
            <Button
              onClick={handleBuy}
              disabled={
                purchased || loading || !hasTicketOptions || !selectedType
              }
            >
              {loading ? "Buying..." : "Buy selected ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : purchased ? (
        <p className="text-xs text-muted-foreground">
          You already have a ticket for this event.
        </p>
      ) : null}
    </div>
  );
}
