import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Handshake,
  Building2,
  Mic2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { BuyTicketButton } from "@/components/buy-ticket-button";

export const dynamic = "force-dynamic";

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "published":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "draft":
      return "bg-muted text-muted-foreground border-border";
    case "ongoing":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "completed":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-foreground border-border";
  }
};

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const currentRole = cookieStore.get("userRole")?.value;
  const isParticipant = currentRole === "PARTICIPANT";

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      company: true,
      organiser: true,
      rooms: true,
      sessions: {
        include: {
          speaker: true,
          room: true,
        },
        orderBy: {
          start: "asc",
        },
      },
      tickets: {
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          price: true,
        },
      },
      exposants: true,
      sponsors: true,
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      networkingRequests: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const ticketSummary = event.tickets.reduce(
    (acc, ticket) => {
      const key = ticket.type;
      const current = acc[key] ?? { count: 0, sold: 0, revenue: 0 };
      const isSoldLike = !!ticket.userId;

      acc[key] = {
        count: current.count + 1,
        sold: current.sold + (isSoldLike ? 1 : 0),
        revenue: current.revenue + (isSoldLike ? ticket.price : 0),
      };

      return acc;
    },
    {} as Record<string, { count: number; sold: number; revenue: number }>,
  );

  const totalTicketRevenue = Object.values(ticketSummary).reduce(
    (sum, row) => sum + row.revenue,
    0,
  );

  const registrationConfirmed = event.registrations.filter(
    (registration) => registration.status === "CONFIRMED",
  ).length;

  const networkingAccepted = event.networkingRequests.filter(
    (request) => request.status === "ACCEPTED",
  ).length;

  const usersWithRoles = [
    {
      id: event.organiser.id,
      name: event.organiser.name,
      email: event.organiser.email,
      role: event.organiser.role,
      source: "Organizer",
    },
    ...event.registrations.map((registration) => ({
      id: registration.user.id,
      name: registration.user.name,
      email: registration.user.email,
      role: registration.user.role,
      source: "Registration",
    })),
  ].filter(
    (user, index, arr) =>
      arr.findIndex((candidate) => candidate.id === user.id) === index,
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-3">
        <Link href="/events">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Events
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {event.title}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  getStatusBadgeVariant(event.status.toLowerCase()),
                )}
              >
                {event.status.toLowerCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-3xl">
              {event.description || "No description provided."}
            </p>
          </div>
          {currentRole === "PARTICIPANT" ? (
            <BuyTicketButton eventId={event.id} />
          ) : (
            <Link href="/events/create">
              <Button className="rounded-xl">Create Event</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Date</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {format(new Date(event.dateStart), "MMM dd, yyyy")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Location</CardDescription>
            <CardTitle className="text-base flex items-center gap-2 line-clamp-1">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription>Tickets</CardDescription>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {event.ticketsSold}/{event.attendeesCount}
            </CardTitle>
          </CardHeader>
        </Card>

        {isParticipant && (
          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription></CardDescription>
              <CardTitle className="text-base">
                {formatCurrency(event.revenue)}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>
              {event.sessions.length} session
              {event.sessions.length === 1 ? "" : "s"} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {event.sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sessions configured yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.title}
                      </TableCell>
                      <TableCell>{session.speaker.name}</TableCell>
                      <TableCell>{session.room.name}</TableCell>
                      <TableCell>{formatDateTime(session.start)}</TableCell>
                      <TableCell>{formatDateTime(session.end)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{event.company.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mic2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Organizer</p>
                <p className="font-medium">{event.organiser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {event.organiser.email}
                </p>
                <Badge variant="outline" className="mt-1 text-[10px] uppercase">
                  {event.organiser.role.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Rooms</p>
                <p className="text-base font-semibold">{event.rooms.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sponsors</p>
                <p className="text-base font-semibold">
                  {event.sponsors.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Exposants</p>
                <p className="text-base font-semibold">
                  {event.exposants.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Networking</p>
                <p className="text-base font-semibold flex items-center gap-1">
                  <Handshake className="h-3.5 w-3.5" />
                  {networkingAccepted}/{event.networkingRequests.length}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">
                  Registrations confirmed
                </p>
                <p className="text-base font-semibold">
                  {registrationConfirmed}/{event.registrations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
          <CardDescription>
            {event.tickets.length} tickets generated ·{" "}
            {formatCurrency(totalTicketRevenue)} realized
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(ticketSummary).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ticket records yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(ticketSummary).map(([type, summary]) => (
                  <TableRow key={type}>
                    <TableCell className="font-medium">
                      {type.replace("_", " ")}
                    </TableCell>
                    <TableCell>{summary.count}</TableCell>
                    <TableCell>{summary.sold}</TableCell>
                    <TableCell>{formatCurrency(summary.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Users & Roles</CardTitle>
          <CardDescription>
            {usersWithRoles.length} user{usersWithRoles.length === 1 ? "" : "s"}{" "}
            linked to this event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersWithRoles.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
