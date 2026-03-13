"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ScanLineIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Loader2Icon,
  QrCodeIcon,
  CameraIcon,
  CameraOffIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ScanTicket = {
  id: string;
  type: string;
  attendeeName: string;
  attendeeEmail: string;
  eventId: string;
  eventTitle: string;
  scannedAt?: string;
};

export default function ScannerPage() {
  const [events, setEvents] = useState<
    Array<{ id: string; title: string; ticketsSold: number }>
  >([]);
  const [activeTickets, setActiveTickets] = useState<
    Array<{ id: string; type: string; eventId: string; userName: string }>
  >([]);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    ticket?: ScanTicket;
    message: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/scanner", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setEvents(payload.events || []);
      setSelectedEvent(payload.selectedEventId || "");
      setActiveTickets(payload.tickets || []);
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;

    const load = async () => {
      const response = await fetch(`/api/scanner?eventId=${selectedEvent}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = await response.json();
      setActiveTickets(payload.tickets || []);
    };

    load();
  }, [selectedEvent]);

  const handleValidateCode = async (value?: string) => {
    const codeToValidate = (value ?? ticketCode).trim();

    if (!codeToValidate) {
      setScanResult({
        success: false,
        message: "Please enter a ticket code.",
      });
      return;
    }

    setIsValidating(true);
    setScanResult(null);

    try {
      const response = await fetch("/api/scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeToValidate,
          eventId: selectedEvent,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setScanResult({
          success: false,
          ticket: payload?.ticket,
          message: payload?.error || "Ticket validation failed.",
        });
        return;
      }

      setScanResult({
        success: true,
        ticket: payload?.ticket,
        message: payload?.message || "Ticket validated successfully.",
      });

      const listResponse = await fetch(
        `/api/scanner?eventId=${encodeURIComponent(selectedEvent)}`,
        {
          cache: "no-store",
        },
      );

      if (listResponse.ok) {
        const listPayload = await listResponse.json();
        setActiveTickets(listPayload.tickets || []);
      }
    } catch {
      setScanResult({
        success: false,
        message: "Unable to validate ticket right now.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      const BarcodeDetectorConstructor = (
        window as unknown as {
          BarcodeDetector?: new (options: { formats: string[] }) => {
            detect: (
              source: ImageBitmapSource,
            ) => Promise<Array<{ rawValue?: string }>>;
          };
        }
      ).BarcodeDetector;

      if (!BarcodeDetectorConstructor) {
        setCameraError("QR detection is not supported in this browser.");
        setIsCameraActive(true);
        return;
      }

      const detector = new BarcodeDetectorConstructor({ formats: ["qr_code"] });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || isValidating) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          const scannedValue = barcodes[0]?.rawValue?.trim();

          if (!scannedValue || scannedValue === lastScannedCode) return;

          setLastScannedCode(scannedValue);
          setTicketCode(scannedValue);
          await handleValidateCode(scannedValue);
        } catch {
          // Ignore intermittent detector errors while camera is running.
        }
      }, 900);

      setIsCameraActive(true);
    } catch {
      setCameraError(
        "Unable to access camera. Please allow camera permissions.",
      );
      stopCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEvent);
  const selectedEventLabel = activeEvent?.title || "";
  const successTicket = scanResult?.success ? scanResult.ticket : undefined;
  const failureTicket =
    scanResult?.success === false ? scanResult.ticket : undefined;
  const resultTicket = successTicket || failureTicket;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
          <p className="text-muted-foreground">
            Scan or enter a ticket code to validate check-in.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select
            value={selectedEvent}
            onValueChange={(val: string | null) => setSelectedEvent(val || "")}
          >
            <SelectTrigger className="w-full rounded-xl bg-background">
              <SelectValue placeholder="Select Event">
                {selectedEventLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title || "Untitled event"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-border/50 bg-card/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 text-primary" />
              Scan & Validate
            </CardTitle>
            <CardDescription>
              Use camera scan or type the code manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border/50 bg-black/80">
              <video
                ref={videoRef}
                className="h-44 w-full object-cover"
                muted
                playsInline
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {!isCameraActive ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => void startCamera()}
                >
                  <CameraIcon className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={stopCamera}
                >
                  <CameraOffIcon className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
              )}
              <div className="flex items-center rounded-xl border border-border/50 px-3 text-xs text-muted-foreground">
                {isCameraActive ? "Camera active" : "Camera stopped"}
              </div>
            </div>

            {cameraError ? (
              <p className="text-xs text-destructive">{cameraError}</p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="ticket-code">Ticket Code</Label>
              <Input
                id="ticket-code"
                value={ticketCode}
                placeholder="ticket:cuid_or_qr_code"
                className="rounded-xl"
                onChange={(event) => setTicketCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleValidateCode();
                  }
                }}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                className="rounded-xl"
                onClick={() => void handleValidateCode()}
                disabled={isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <ScanLineIcon className="mr-2 h-4 w-4" />
                    Validate Ticket
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setTicketCode("");
                  setScanResult(null);
                  setLastScannedCode(null);
                }}
              >
                Clear
              </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
              Event:{" "}
              <span className="font-medium text-foreground">
                {activeEvent?.title ?? "None selected"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "rounded-2xl border-border/50 bg-card/60 shadow-sm backdrop-blur",
            scanResult?.success
              ? "border-emerald-500/40 bg-emerald-500/5"
              : scanResult?.success === false
                ? "border-destructive/50 bg-destructive/5"
                : "",
          )}
        >
          <CardHeader>
            <CardTitle>Validation Result</CardTitle>
            <CardDescription>Latest scanned/validated ticket</CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                No validation yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      scanResult.success
                        ? "bg-emerald-500/20 text-emerald-500"
                        : "bg-destructive/20 text-destructive",
                    )}
                  >
                    {scanResult.success ? (
                      <CheckCircle2Icon className="h-6 w-6" />
                    ) : (
                      <XCircleIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-base font-semibold",
                        scanResult.success
                          ? "text-emerald-500"
                          : "text-destructive",
                      )}
                    >
                      {scanResult.message}
                    </p>
                  </div>
                </div>

                {resultTicket && (
                  <div className="space-y-3 rounded-xl border border-border/50 bg-background p-4">
                    <div className="grid gap-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Attendee:</span>{" "}
                        <span className="font-medium text-foreground">
                          {resultTicket.attendeeName || "Unknown"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-medium text-foreground">
                          {resultTicket.attendeeEmail || "No email"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Event:</span>{" "}
                        <span className="font-medium text-foreground">
                          {resultTicket.eventTitle}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium text-foreground">
                          {resultTicket.type.replaceAll("_", " ")}
                        </span>
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                      Ticket ID: {resultTicket.id}
                    </div>
                  </div>
                )}

                {failureTicket?.scannedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Already scanned at{" "}
                    {new Date(failureTicket.scannedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
