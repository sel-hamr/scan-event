import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  QrCode,
  Ticket,
  CircleDollarSign,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const getTicketTypeVariant = (type: string) => {
  switch (type.toLowerCase()) {
    case "vip":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "standard":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "early_bird":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "free":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-foreground border-border";
  }
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500 border-none";
    case "used":
      return "bg-muted text-muted-foreground border-none";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-none";
    case "expired":
      return "bg-purple-500/10 text-purple-500 border-none";
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
    width: 320,
    margin: 1,
    color: {
      dark: "#111827",
      light: "#FFFFFF",
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-3">
        <Link href="/tickets/mine">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            My Tickets
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Ticket {ticket.id}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase font-bold",
                  getStatusVariant(ticket.status),
                )}
              >
                {ticket.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              Your ticket details and QR code for check-in.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Ticket Type</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              <Badge
                variant="outline"
                className={cn("uppercase", getTicketTypeVariant(ticket.type))}
              >
                {ticket.type.replace("_", " ")}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Price</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-primary" />
              {ticket.price === 0 ? "Free" : formatCurrency(ticket.price)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Event Date</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDateTime(ticket.event.dateStart)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>QR Status</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {activeQrCode?.scanned ? "Scanned" : "Ready"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>
              Linked event data from the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  Event
                </div>
                <div>
                  <Link
                    href={`/events/${ticket.event.id}`}
                    className="font-semibold transition-colors hover:text-primary"
                  >
                    {ticket.event.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.event.location}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(ticket.event.dateStart)}
                  </p>
                  <Badge variant="outline" className="mt-3 uppercase">
                    {ticket.event.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <QrCode className="h-4 w-4 text-primary" />
                  Stored QR Data
                </div>
                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Encoded value</p>
                    <p className="font-mono break-all">{qrValue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Scan state</p>
                    <p>
                      {activeQrCode?.scanned
                        ? `Scanned ${formatDateTime(activeQrCode.scannedAt ?? new Date())}`
                        : "Not scanned yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 h-fit">
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>
              Use this code for scanning and check-in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm">
              <img
                src={qrImage}
                alt={`QR code for ticket ${ticket.id}`}
                className="h-full w-full rounded-xl"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-mono text-xs break-all">{qrValue}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
