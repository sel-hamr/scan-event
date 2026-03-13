import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Ticket as TicketIcon,
  Handshake,
  Shield,
  QrCode,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  PARTICIPANT: "Participant",
  ORGANISATEUR: "Organizer",
  SCANNER: "Scanner",
  EXPOSANT: "Exhibitor",
  SPEAKER: "Speaker",
  SUPER_ADMIN: "Super Admin",
};

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

const getTicketStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500 border-none";
    case "used":
      return "bg-blue-500/10 text-blue-500 border-none";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-none";
    case "expired":
      return "bg-purple-500/10 text-purple-500 border-none";
    default:
      return "bg-muted text-foreground border-none";
  }
};

export default async function NetworkingUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          website: true,
        },
      },
      tickets: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              dateStart: true,
              location: true,
            },
          },
          qrCodes: {
            select: {
              id: true,
              code: true,
              scanned: true,
              scannedAt: true,
            },
            orderBy: {
              scannedAt: "desc",
            },
          },
        },
        orderBy: {
          event: {
            dateStart: "desc",
          },
        },
      },
      organizedEvents: {
        select: {
          id: true,
        },
      },
      registrations: {
        select: {
          id: true,
          status: true,
        },
      },
      sentRequests: {
        select: {
          id: true,
          status: true,
        },
      },
      receivedRequests: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const totalSpent = user.tickets.reduce(
    (sum, ticket) => sum + ticket.price,
    0,
  );
  const activeTickets = user.tickets.filter(
    (ticket) => ticket.status === "ACTIVE",
  ).length;
  const usedTickets = user.tickets.filter(
    (ticket) => ticket.status === "USED",
  ).length;
  const acceptedConnections = [
    ...user.sentRequests,
    ...user.receivedRequests,
  ].filter((request) => request.status === "ACCEPTED").length;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-3">
        <Link href="/networking/users">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Users
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border border-border/50 shadow-sm">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {user.name}
                </h1>
                <Badge variant="outline" className="uppercase">
                  {roleLabels[user.role] ?? user.role}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 max-w-3xl">
                Complete profile, networking activity, and ticket history for
                this user.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Total Tickets</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <TicketIcon className="h-4 w-4 text-primary" />
              {user.tickets.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatCurrency(totalSpent)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Accepted Connections</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <Handshake className="h-4 w-4 text-primary" />
              {acceptedConnections}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50 h-fit">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">
                  {roleLabels[user.role] ?? user.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">
                  {user.company?.name || "No company assigned"}
                </p>
                {user.company?.email ? (
                  <p className="text-xs text-muted-foreground">
                    {user.company.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Organized Events
                </p>
                <p className="text-base font-semibold">
                  {user.organizedEvents.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registrations</p>
                <p className="text-base font-semibold">
                  {user.registrations.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Tickets</p>
                <p className="text-base font-semibold">{activeTickets}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Used Tickets</p>
                <p className="text-base font-semibold">{usedTickets}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sent Requests</p>
                <p className="text-base font-semibold">
                  {user.sentRequests.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Received Requests
                </p>
                <p className="text-base font-semibold">
                  {user.receivedRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket History</CardTitle>
            <CardDescription>
              {user.tickets.length} ticket{user.tickets.length === 1 ? "" : "s"}{" "}
              assigned to this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tickets found for this user.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.tickets.map((ticket) => {
                    const latestQrCode = ticket.qrCodes[0];

                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <Link
                              href={`/events/${ticket.event.id}`}
                              className="font-medium transition-colors hover:text-primary"
                            >
                              {ticket.event.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {ticket.event.location}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(ticket.event.dateStart)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] uppercase font-bold",
                              getTicketTypeVariant(ticket.type),
                            )}
                          >
                            {ticket.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.price === 0
                            ? "Free"
                            : formatCurrency(ticket.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] uppercase font-bold",
                              getTicketStatusVariant(ticket.status),
                            )}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {latestQrCode ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <QrCode className="h-3.5 w-3.5" />
                              <div>
                                <p className="font-mono text-[11px] text-foreground">
                                  {latestQrCode.code.slice(0, 10)}...
                                </p>
                                <p>
                                  {latestQrCode.scanned
                                    ? `Scanned ${formatDateTime(latestQrCode.scannedAt ?? new Date())}`
                                    : "Not scanned"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No QR code
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
