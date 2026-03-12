"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanLineIcon, CheckCircle2Icon, XCircleIcon, CameraIcon, SmartphoneIcon, MapPinIcon, Loader2Icon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEvents, mockTickets } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0].id);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    ticket?: typeof mockTickets[0];
    message: string;
  } | null>(null);

  // Mock scan function for demonstration
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    
    setTimeout(() => {
      // Randomly pick success or failure
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        const ticket = mockTickets.find(t => t.event_id === selectedEvent && t.status === 'active');
        if (ticket) {
          setScanResult({
            success: true,
            ticket,
            message: "Check-in successful!"
          });
        } else {
          setScanResult({
            success: false,
            message: "Ticket not found or already used."
          });
        }
      } else {
        setScanResult({
          success: false,
          message: "Invalid QR code format."
        });
      }
      setIsScanning(false);
    }, 1500);
  };

  const activeEvent = mockEvents.find(e => e.id === selectedEvent);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
          <p className="text-muted-foreground">Scan attendee tickets for check-in.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedEvent} onValueChange={(val: any) => setSelectedEvent(val as string)}>
            <SelectTrigger className="w-full sm:w-[250px] rounded-xl bg-background">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {mockEvents.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner Component Area */}
        <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <CameraIcon className="h-5 w-5 text-primary" />
              Camera Feed
            </CardTitle>
            <CardDescription>Point camera at the QR code</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-square md:aspect-auto md:h-[400px] bg-black flex flex-col items-center justify-center overflow-hidden group">
              
              {/* Fake scanner viewfinder overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary/50 relative">
                  {/* Corners */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
                  
                  {/* Scanning scan line animation */}
                  {isScanning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary blur-[2px] shadow-[0_0_15px_3px_rgb(5,148,103)] animate-[scan_2s_ease-in-out_infinite]" />
                  )}
                </div>
              </div>

              {/* Faux Camera View */}
              {!isScanning ? (
                <div className="flex flex-col items-center justify-center text-zinc-500 gap-4">
                  <ScanLineIcon className="h-16 w-16 opacity-50" />
                  <p>Camera ready</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-primary gap-4">
                  <Loader2Icon className="h-16 w-16 animate-spin" />
                  <p>Analyzing QR code...</p>
                </div>
              )}

            </div>
          </CardContent>
          <CardFooter className="p-4 bg-muted/50 border-t border-border/50 flex justify-between">
            <Button variant="outline" className="rounded-xl">
              Switch Camera
            </Button>
            <Button 
              className="rounded-xl bg-primary hover:bg-primary/90"
              onClick={handleSimulateScan}
              disabled={isScanning}
            >
              Simulate Scan
            </Button>
          </CardFooter>
        </Card>

        {/* Scan Results Area */}
        <div className="flex flex-col gap-4">
          <Card className={cn(
            "rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-300",
            scanResult?.success ? "border-emerald-500/50 bg-emerald-500/5" :
            scanResult?.success === false ? "border-destructive/50 bg-destructive/5" : ""
          )}>
            <CardHeader>
              <CardTitle>Scan Result</CardTitle>
              <CardDescription>Latest scanned ticket details</CardDescription>
            </CardHeader>
            <CardContent>
              {scanResult ? (
                <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-300">
                  {scanResult.success ? (
                    <>
                      <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-500">{scanResult.message}</h3>
                      
                      {scanResult.ticket && (
                        <div className="w-full mt-4 rounded-xl border border-border/50 bg-background p-4 text-left space-y-3 shadow-inner">
                          <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wider flex justify-between items-center">
                            Ticket Details
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-xs shadow-none">VALID</span>
                          </p>
                          <div className="grid grid-cols-2 gap-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Attendee</p>
                              <p className="font-medium">{scanResult.ticket.user_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Type</p>
                              <p className="font-medium uppercase">{scanResult.ticket.type.replace('_',' ')}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-muted-foreground">Ticket ID</p>
                              <p className="font-medium font-mono text-xs truncate">{scanResult.ticket.id}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
                        <XCircleIcon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-destructive">{scanResult.message}</h3>
                      <p className="text-muted-foreground">Please ask the attendee to see an organizer for assistance.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-48 space-y-3 text-muted-foreground">
                  <SmartphoneIcon className="h-12 w-12 opacity-20" />
                  <p>Scan a QR code to view details here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Event Context info */}
          <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur h-full">
            <CardHeader className="py-4">
              <CardTitle className="text-base">Current Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MapPinIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Gate / Check-in Point</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Main Entrance, Desk 3</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                  <div className="font-bold text-xs">
                    {activeEvent?.tickets_sold ?? 0}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Event Check-ins</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Math.floor((activeEvent?.tickets_sold ?? 0) * 0.45)} checked in today
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
