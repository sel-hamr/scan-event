"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, MessageSquareIcon } from "lucide-react";
import { updateRequestStatus, deleteRequest } from "@/app/actions/networking-actions";
import { useState } from "react";

interface NetworkingCardActionsProps {
  requestId: string;
  status: string;
}

export function NetworkingCardActions({ requestId, status }: NetworkingCardActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: "ACCEPTED" | "REJECTED") => {
    setIsLoading(true);
    try {
      await updateRequestStatus(requestId, newStatus);
    } catch (error) {
      console.error("Failed to update request status", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    
    setIsLoading(true);
    try {
      await deleteRequest(requestId);
    } catch (error) {
      console.error("Failed to remove connection", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'PENDING') {
    return (
      <div className="flex gap-2">
        <Button 
          size="icon" 
          variant="outline" 
          className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent bg-destructive/5"
          onClick={() => handleStatusUpdate("REJECTED")}
          disabled={isLoading}
        >
          <XIcon className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          className="h-8 w-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={() => handleStatusUpdate("ACCEPTED")}
          disabled={isLoading}
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (status === 'ACCEPTED') {
    return (
      <Button size="sm" variant="outline" className="h-8 rounded-lg" disabled={isLoading}>
        <MessageSquareIcon className="h-3.5 w-3.5 mr-2" />
        Message
      </Button>
    );
  }

  return null;
}
