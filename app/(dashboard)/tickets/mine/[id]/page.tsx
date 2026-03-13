import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  CircleDollarSign,
  CheckCircle2,
  ScanLine,
  Download,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCodeDownloadButton } from "@/components/tickets/qr-code-download-button";

export const dynamic = "force-dynamic";

const getTicketTypeGradient = (type: string) => {
  switch (type.toLowerCase()) {
    case "vip":
      return {
        hero: "from-amber-950/80 via-yellow-950/60 to-card",
        stripe: "from-amber-500 via-yellow-400 to-orange-500",
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        glow: "shadow-amber-500/20",
        icon: "text-amber-400",
        accent: "bg-amber-500",
      };
    case "standard":
      return {
        hero: "from-blue-950/80 via-indigo-950/60 to-card",
        stripe: "from-blue-500 via-indigo-500 to-violet-500",
        badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        glow: "shadow-blue-500/20",
        icon: "text-blue-400",
        accent: "bg-blue-500",
      };
    case "early_bird":
      return {
        hero: "from-emerald-950/80 via-teal-950/60 to-card",
        stripe: "from-emerald-500 via-teal-400 to-cyan-500",
        badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        glow: "shadow-emerald-500/20",
        icon: "text-emerald-400",
        accent: "bg-emerald-500",
      };
    case "free":
    default:
      return {
        hero: "from-zinc-900/80 via-zinc-800/60 to-card",
        stripe: "from-zinc-500 via-zinc-400 to-zinc-500",
        badge: "bg-muted text-muted-foreground border-border",
        glow: "shadow-zinc-500/10",
        icon: "text-muted-foreground",
        accent: "bg-muted-foreground",
      };
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

export default async function MyTicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (!userId) {
    redirect("/login");
  }

  if (userRole !== "PARTICIPANT") {
    redirect(`/tickets/${id}`);
  }

  const ticket = await prisma.ticket.findFirst({
    where: {
      id,
      userId,
    },
    include: {
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
    width: 500,
    margin: 2,
    color: {
      dark: "#0a0a0a",
      light: "#FFFFFF",
    },
  });

  const theme = getTicketTypeGradient(ticket.type);
  const isActive = ticket.status.toLowerCase() === "active";
  const isScanned = activeQrCode?.scanned;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500 pb-16">
      {/* Back nav */}
      <div>
        <Link href="/tickets/mine">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            My Tickets
          </Button>
        </Link>
      </div>

      {/* Hero greeting */}
      <div className={cn("relative rounded-3xl overflow-hidden p-8 lg:p-10 bg-gradient-to-br border border-border/30", theme.hero)}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.04)_0%,_transparent_60%)] pointer-events-none" />
        {/* Gradient stripe at top */}
        <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-70", theme.stripe)} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className={cn("h-4 w-4", theme.icon)} />
              <p className="text-sm font-medium text-muted-foreground">Your Ticket</p>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-3">
              {ticket.event.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={cn("uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-full", theme.badge)}
              >
                ✦ {ticket.type.replace("_", " ")}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[10px] uppercase font-bold tracking-wider", getStatusVariant(ticket.status))}
              >
                {ticket.status}
              </Badge>
            </div>
          </div>

          {isActive && !isScanned && (
            <div className="flex flex-col items-center gap-2 shrink-0 text-center">
              <div className="relative w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-30" />
                <PartyPopper className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Ready to Scan</p>
            </div>
          )}
        </div>
      </div>

      {/* Main ticket body */}
      <div className="max-w-4xl w-full">
        <div
          className={cn(
            "relative flex flex-col lg:flex-row rounded-3xl overflow-hidden border border-border/50 bg-card shadow-2xl",
            theme.glow,
            "shadow-xl",
          )}
        >
          {/* Top gradient stripe */}
          <div className={cn("absolute top-0 left-0 right-0 h-px bg-gradient-to-r opacity-50", theme.stripe)} />

          {/* Left accent bar */}
          <div className={cn("absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b opacity-40", theme.stripe)} />

          {/* Main info column */}
          <div className="relative flex-1 p-8 lg:p-10 flex flex-col gap-7">
            {/* Event meta */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{ticket.event.location}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" /> Starts
                  </p>
                  <p className="font-bold text-base">{formatDateTime(ticket.event.dateStart)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Ends
                  </p>
                  <p className="font-bold text-base">{formatDateTime(ticket.event.dateEnd)}</p>
                </div>
              </div>
            </div>

            {/* Ticket meta grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/30 pt-6">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <CircleDollarSign className="h-3 w-3" /> Price Paid
                </p>
                <p className="font-bold">
                  {ticket.price === 0 ? (
                    <span className="text-emerald-400">Free</span>
                  ) : (
                    formatCurrency(ticket.price)
                  )}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <ScanLine className="h-3 w-3" /> Scan Status
                </p>
                {isScanned ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <p className="font-bold text-sm text-emerald-400">Checked In</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
                    <p className="font-bold text-sm text-muted-foreground">Awaiting Scan</p>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Ticket className="h-3 w-3" /> Ticket Reference
                </p>
                <p className="font-mono text-xs text-foreground/70">{ticket.id}</p>
              </div>
            </div>

            {/* Scanned confirmation banner */}
            {isScanned && activeQrCode?.scannedAt && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">You're checked in! 🎉</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Scanned on {formatDateTime(activeQrCode.scannedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* === PERFORATED DIVIDER === */}
          <div className="relative flex items-center justify-center lg:flex-col z-10">
            <div className="hidden lg:block w-0 h-full border-l-2 border-dashed border-border/40 mx-4" />
            <div className="lg:hidden h-0 w-full border-t-2 border-dashed border-border/40 my-0" />
            {/* Cutout circles — top/left and bottom/right */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:left-auto lg:-left-4 w-8 h-8 bg-background rounded-full border border-border/50 -mt-4 lg:mt-0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:translate-y-1/2 lg:left-auto lg:-left-4 w-8 h-8 bg-background rounded-full border border-border/50 -mb-4 lg:mb-0" />
          </div>

          {/* === QR STUB === */}
          <div className="relative flex flex-col items-center justify-center gap-5 p-8 lg:p-10 lg:min-w-[260px]">
            {/* Section label */}
            <div className="text-center">
              <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                Entry Pass
              </p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                Present at venue entrance
              </p>
            </div>

            {/* QR Code */}
            <div className="relative group">
              {/* Ambient glow */}
              <div className={cn(
                "absolute -inset-3 rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 bg-gradient-to-br",
                theme.stripe,
              )} />
              <div className={cn(
                "relative rounded-2xl p-4 bg-white shadow-xl border-2 transition-all duration-300",
                isScanned ? "border-emerald-400/60" : "border-transparent group-hover:border-white/20",
              )}>
                <img
                  src={qrImage}
                  alt="Your entry QR code"
                  className="w-[200px] h-[200px] object-contain block"
                />
                {/* Scanned overlay */}
                {isScanned && (
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <div className="bg-white/95 rounded-xl px-3 py-2 flex items-center gap-2 shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Used</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR value */}
            <p className="font-mono text-[9px] text-muted-foreground/50 break-all text-center max-w-[200px] leading-relaxed">
              {qrValue}
            </p>

            {/* Download button */}
            <QrCodeDownloadButton qrImage={qrImage} ticketId={ticket.id} />
          </div>
        </div>

        {/* Tip below ticket */}
        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          💡 Save your QR code offline to ensure smooth entry even without internet access.
        </p>
      </div>
    </div>
  );
}
