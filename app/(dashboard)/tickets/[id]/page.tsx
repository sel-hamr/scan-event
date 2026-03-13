import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  User,
  CircleDollarSign,
  CheckCircle2,
  ScanLine,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCodeDownloadButton } from "@/components/tickets/qr-code-download-button";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const getTicketTypeGradient = (type: string) => {
  switch (type.toLowerCase()) {
    case "vip":
      return "from-amber-500/20 via-yellow-500/10 to-orange-500/5";
    case "standard":
      return "from-blue-500/20 via-indigo-500/10 to-violet-500/5";
    case "early_bird":
      return "from-emerald-500/20 via-teal-500/10 to-cyan-500/5";
    case "free":
      return "from-muted/50 via-muted/30 to-muted/10";
    default:
      return "from-primary/20 via-primary/10 to-transparent";
  }
};

const getTicketAccentColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "vip":
      return "bg-amber-500";
    case "standard":
      return "bg-blue-500";
    case "early_bird":
      return "bg-emerald-500";
    case "free":
      return "bg-muted-foreground";
    default:
      return "bg-primary";
  }
};

const getTicketTypeVariant = (type: string) => {
  switch (type.toLowerCase()) {
    case "vip":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "standard":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "early_bird":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "free":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-foreground border-border";
  }
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "used":
      return "bg-muted text-muted-foreground border-none";
    case "cancelled":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "expired":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    default:
      return "bg-muted text-foreground border-none";
  }
};

const getStatusDot = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-500";
    case "used":
      return "bg-muted-foreground";
    case "cancelled":
      return "bg-destructive";
    case "expired":
      return "bg-purple-500";
    default:
      return "bg-muted-foreground";
  }
};

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          dateStart: true,
          dateEnd: true,
          location: true,
          status: true,
        },
      },
      qrCodes: {
        select: {
          id: true,
          code: true,
          scanned: true,
          scannedAt: true,
          scannedBy: true,
        },
        orderBy: {
          scannedAt: "desc",
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const activeQrCode = ticket.qrCodes[0];
  const qrValue = activeQrCode?.code ?? `ticket:${ticket.id}`;
  const qrImage = await QRCode.toDataURL(qrValue, {
    width: 400,
    margin: 1,
    color: {
      dark: "#0a0a0a",
      light: "#FFFFFF",
    },
  });

  const accentGradient = getTicketTypeGradient(ticket.type);
  const accentBar = getTicketAccentColor(ticket.type);
  const isScanned = activeQrCode?.scanned;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500 pb-16">
      {/* Back navigation */}
      <div>
        <Link href="/tickets">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            All Tickets
          </Button>
        </Link>
      </div>

      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", getStatusDot(ticket.status))} />
            <h1 className="text-3xl font-bold tracking-tight">
              {ticket.event.title}
            </h1>
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase font-bold tracking-wider px-2.5 py-1", getStatusVariant(ticket.status))}
            >
              {ticket.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            Full ticket details, attendee information, and the QR code for venue check-in.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/events/${ticket.event.id}`}>
            <Button variant="outline" size="sm" className="rounded-xl gap-2">
              <Calendar className="h-3.5 w-3.5" />
              View Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Main ticket card */}
      <div className="max-w-5xl w-full">
        <div
          className={cn(
            "relative flex flex-col lg:flex-row rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-card",
          )}
        >
          {/* Gradient accent overlay */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", accentGradient)} />

          {/* Accent bar on top */}
          <div className={cn("absolute top-0 left-0 right-0 h-1 lg:h-full lg:w-1 lg:right-auto", accentBar, "opacity-80")} />

          {/* Subtle texture/shimmer overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.04)_0%,_transparent_60%)] pointer-events-none" />

          {/* === LEFT / MAIN INFO SECTION === */}
          <div className="relative flex-1 p-8 lg:p-10 flex flex-col gap-8 lg:pl-12">
            {/* Top: type badge + ticket ID */}
            <div className="flex items-start justify-between gap-4">
              <Badge
                variant="outline"
                className={cn(
                  "uppercase text-xs font-bold tracking-widest px-3 py-1.5 rounded-full",
                  getTicketTypeVariant(ticket.type),
                )}
              >
                ✦ {ticket.type.replace("_", " ")}
              </Badge>
              <div className="text-right">
                <p className="text-[9px] uppercase text-muted-foreground font-semibold tracking-widest mb-0.5">
                  Ticket ID
                </p>
                <p className="font-mono text-xs text-foreground/70">
                  #{ticket.id.slice(0, 16)}
                </p>
              </div>
            </div>

            {/* Event title & location */}
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-3 leading-tight">
                {ticket.event.title}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{ticket.event.location}</span>
                <span className="mx-1 text-border">•</span>
                <Badge variant="outline" className="uppercase text-[9px] font-bold tracking-wider">
                  {ticket.event.status}
                </Badge>
              </div>
            </div>

            {/* Attendee card */}
            <div className="p-5 rounded-2xl bg-background/50 border border-border/40 backdrop-blur-sm flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", accentBar, "bg-opacity-15")}>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              {ticket.user ? (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-11 w-11 border-2 border-border/40 shadow-md">
                    <AvatarImage src={ticket.user.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {ticket.user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      href={`/networking/users/${ticket.user.id}`}
                      className="font-semibold text-sm hover:text-primary transition-colors block truncate"
                    >
                      {ticket.user.name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {ticket.user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-sm">Unassigned Ticket</p>
                  <p className="text-xs text-muted-foreground">
                    Not yet assigned to a user.
                  </p>
                </div>
              )}
              <div className="ml-auto shrink-0">
                <ShieldCheck className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" />
                  Date & Time
                </p>
                <p className="font-semibold text-sm">{formatDateTime(ticket.event.dateStart)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Event Ends
                </p>
                <p className="font-semibold text-sm">{formatDateTime(ticket.event.dateEnd)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                  <CircleDollarSign className="h-3 w-3" />
                  Price Paid
                </p>
                <p className="font-semibold text-sm">
                  {ticket.price === 0 ? (
                    <span className="text-emerald-400">Free</span>
                  ) : (
                    formatCurrency(ticket.price)
                  )}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                  <ScanLine className="h-3 w-3" />
                  Scan Status
                </p>
                {isScanned ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-sm text-emerald-400">Checked in</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    <p className="font-semibold text-sm text-muted-foreground">Not scanned</p>
                  </div>
                )}
              </div>
            </div>

            {/* Scan detail if scanned */}
            {isScanned && activeQrCode?.scannedAt && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-emerald-400">Ticket successfully scanned</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDateTime(activeQrCode.scannedAt)}
                    {activeQrCode.scannedBy ? ` · by ${activeQrCode.scannedBy}` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* === PERFORATED DIVIDER === */}
          <div className="relative flex items-center justify-center lg:flex-col">
            {/* Horizontal (mobile) or Vertical (desktop) dashed line */}
            <div className="hidden lg:block w-px h-full border-l-2 border-dashed border-border/40 mx-4" />
            <div className="lg:hidden h-px w-full border-t-2 border-dashed border-border/40 my-0" />
            {/* Cutout circles */}
            <div className="absolute top-0 -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2 left-1/2 lg:left-auto lg:-left-4 w-8 h-8 bg-background rounded-full border border-border/50 -mt-4 lg:mt-0" />
            <div className="absolute bottom-0 -translate-x-1/2 lg:translate-x-0 lg:translate-y-1/2 left-1/2 lg:left-auto lg:-left-4 w-8 h-8 bg-background rounded-full border border-border/50 mb-[-1px] lg:mb-0" />
          </div>

          {/* === RIGHT / QR STUB SECTION === */}
          <div className="relative flex flex-col justify-center items-center p-8 lg:p-10 min-w-0 lg:min-w-[280px] gap-6">
            {/* QR label */}
            <div className="text-center">
              <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
                Entry QR Code
              </p>
              <p className="text-[10px] text-muted-foreground/60">Scan at venue entrance</p>
            </div>

            {/* QR Code display */}
            <div className="relative group">
              {/* Glow effect */}
              <div className={cn("absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500", accentBar, "bg-opacity-20")} />
              <div className={cn(
                "relative bg-white p-5 rounded-2xl shadow-lg border-2 transition-all duration-300",
                isScanned ? "border-emerald-400/50" : "border-border/20 group-hover:border-border/40",
              )}>
                <img
                  src={qrImage}
                  alt={`QR code for ticket ${ticket.id}`}
                  className="w-[180px] h-[180px] object-contain block"
                />
                {isScanned && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Used</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR value */}
            <p className="font-mono text-[9px] text-muted-foreground/60 break-all text-center px-2 max-w-[200px]">
              {qrValue}
            </p>

            {/* Download button */}
            <QrCodeDownloadButton qrImage={qrImage} ticketId={ticket.id} />

            {!activeQrCode && (
              <p className="text-[9px] text-muted-foreground/50 text-center leading-relaxed max-w-[180px]">
                QR generated from ticket ID — no database record found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
