"use client";

import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function QrCodeDownloadButton({
  qrImage,
  ticketId,
}: {
  qrImage: string;
  ticketId: string;
}) {
  const [state, setState] = useState<"idle" | "downloading" | "done">("idle");

  const handleDownload = () => {
    setState("downloading");
    const a = document.createElement("a");
    a.href = qrImage;
    a.download = `ticket-${ticketId}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    }, 400);
  };

  return (
    <Button
      id={`qr-download-${ticketId}`}
      onClick={handleDownload}
      variant="outline"
      disabled={state === "downloading"}
      className="w-full gap-2 rounded-xl transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary"
    >
      {state === "idle" && (
        <>
          <Download className="h-3.5 w-3.5" />
          Save QR Code
        </>
      )}
      {state === "downloading" && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving…
        </>
      )}
      {state === "done" && (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-emerald-400">Saved!</span>
        </>
      )}
    </Button>
  );
}
