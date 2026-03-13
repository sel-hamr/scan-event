"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendFriendRequest } from "@/app/actions/networking-actions";

type SendFriendRequestButtonProps = {
  receiverId: string;
  receiverName: string;
  disabled?: boolean;
  label?: string;
};

function SubmitRequestButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Sending..." : "Send request"}
    </Button>
  );
}

export function SendFriendRequestButton({
  receiverId,
  receiverName,
  disabled = false,
  label = "Send friend request",
}: SendFriendRequestButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    await sendFriendRequest(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="w-full rounded-xl" disabled={disabled} />}
      >
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send friend request</DialogTitle>
          <DialogDescription>
            Write a short message to {receiverName} before sending your request.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="receiverId" value={receiverId} />
          <Textarea
            name="message"
            placeholder="Hi, I'd like to connect with you."
            className="min-h-28 rounded-xl bg-background"
            maxLength={300}
          />
          <DialogFooter>
            <SubmitRequestButton disabled={disabled} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
