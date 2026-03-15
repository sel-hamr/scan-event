import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
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
  ShieldCheck,
  Ticket,
  Wallet,
  UserCheck,
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
import { EditEventDrawer } from "@/components/events/edit-event-drawer";
import { EventManagementTabs } from "@/components/events/event-management-tabs";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";
import { getDisplayEventStatus } from "@/lib/event-status";

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

const formatRoleLabel = (role?: string | null) =>
  role ? role.replaceAll("_", " ").toLowerCase() : "user";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getAuthFromCookieStore();
  const currentRole = auth?.role;
  const currentUserId = auth?.userId;

  const canBuyTicket = ["PARTICIPANT", "SCANNER", "SPEAKER"].includes(
    currentRole ?? "",
  );
  const canViewManagementData = ["ORGANISATEUR", "SUPER_ADMIN"].includes(
    currentRole ?? "",
  );

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

  const canEditEvent =
    currentRole === "SUPER_ADMIN" ||
    currentRole === "ORGANISATEUR" ||
    (currentRole === "PARTICIPANT" && currentUserId === event.organiserId);

  const companies = canEditEvent
    ? await prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const speakers = canEditEvent
    ? await prisma.speaker.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

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

  const availableTicketOptions = Object.entries(ticketSummary)
    .map(([type, summary]) => ({
      type,
      label: type.replaceAll("_", " "),
      price:
        event.tickets.find(
          (ticket) => ticket.type === type && ticket.userId === null,
        )?.price ?? 0,
      available: summary.count - summary.sold,
    }))
    .filter((option) => option.available > 0)
    .sort((left, right) => left.price - right.price);

  const editableTicketTiers = Object.entries(ticketSummary).map(
    ([type, summary]) => ({
      type,
      price: event.tickets.find((ticket) => ticket.type === type)?.price ?? 0,
      capacity: summary.count,
    }),
  );

  const hasPurchasedTicket = !!currentUserId
    ? event.tickets.some(
        (ticket) =>
          ticket.userId === currentUserId &&
          ["ACTIVE", "USED"].includes(ticket.status),
      )
    : false;

  const registrationConfirmed = event.registrations.filter(
    (registration) => registration.status === "CONFIRMED",
  ).length;

  const networkingAccepted = event.networkingRequests.filter(
    (request) => request.status === "ACCEPTED",
  ).length;

  const roleContextLabel =
    currentRole === "SUPER_ADMIN"
      ? "Admin view"
      : currentRole === "ORGANISATEUR"
        ? "Organizer view"
        : currentRole === "SCANNER"
          ? "Scanner view"
          : currentRole === "SPEAKER"
            ? "Speaker view"
            : "Participant view";

  const displayEventStatus = getDisplayEventStatus(
    event.status,
    event.dateStart,
    event.dateEnd,
  );

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

  const infoSections = (
    <>
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
    </>
  );

  const managementUsersCard = (
    <Card className="rounded-2xl border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Users & Roles</CardTitle>
        <CardDescription>
          {usersWithRoles.length} user
          {usersWithRoles.length === 1 ? "" : "s"} linked to this event
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
  );

  const attendeeCommunityCard = (
    <Card className="rounded-2xl border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle>Community Snapshot</CardTitle>
        <CardDescription>
          Live participation overview for attendees and speakers.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-background/30 p-3">
          <p className="text-xs text-muted-foreground">Sponsors</p>
          <p className="text-xl font-semibold">{event.sponsors.length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/30 p-3">
          <p className="text-xs text-muted-foreground">Exposants</p>
          <p className="text-xl font-semibold">{event.exposants.length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/30 p-3">
          <p className="text-xs text-muted-foreground">Networking Accepted</p>
          <p className="text-xl font-semibold">{networkingAccepted}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-background/30 p-3">
          <p className="text-xs text-muted-foreground">
            Confirmed Registrations
          </p>
          <p className="text-xl font-semibold">{registrationConfirmed}</p>
        </div>
      </CardContent>
    </Card>
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
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {event.title}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  getStatusBadgeVariant(displayEventStatus),
                )}
              >
                {displayEventStatus}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {roleContextLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 max-w-3xl">
              {event.description || "No description provided."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/50 px-2 py-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(new Date(event.dateStart), "dd MMM yyyy")} -{" "}
                {format(new Date(event.dateEnd), "dd MMM yyyy")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/50 px-2 py-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/50 px-2 py-1 capitalize">
                <ShieldCheck className="h-3.5 w-3.5" />
                Signed in as {formatRoleLabel(currentRole)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canBuyTicket ? (
              <BuyTicketButton
                eventId={event.id}
                ticketOptions={availableTicketOptions}
                hasPurchased={hasPurchasedTicket}
              />
            ) : null}

            {canEditEvent ? (
              <EditEventDrawer
                event={{
                  id: event.id,
                  title: event.title,
                  description: event.description ?? "",
                  location: event.location,
                  status: event.status,
                  dateStart: event.dateStart.toISOString(),
                  dateEnd: event.dateEnd.toISOString(),
                  companyId: event.companyId,
                  category: event.category,
                  banner: event.banner,
                  dateEndRegistration:
                    event.dateEndRegistration?.toISOString() ?? null,
                  typeTicket: event.typeTicket,
                  price: event.price,
                  sessions: event.sessions.map((session) => ({
                    id: session.id,
                    title: session.title,
                    description: session.description ?? "",
                    speakerId: session.speakerId,
                    start: session.start.toISOString(),
                    end: session.end.toISOString(),
                  })),
                  ticketTiers: editableTicketTiers,
                }}
                companies={companies}
                speakers={speakers}
              />
            ) : null}
          </div>
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
              <Ticket className="h-4 w-4 text-primary" />
              {event.ticketsSold}/{event.attendeesCount}
            </CardTitle>
          </CardHeader>
        </Card>

        {canViewManagementData ? (
          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription>Revenue</CardDescription>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                {formatCurrency(totalTicketRevenue)}
              </CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardDescription>Confirmed attendees</CardDescription>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                {registrationConfirmed}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      {canViewManagementData ? (
        <EventManagementTabs
          ticketBreakdown={Object.entries(ticketSummary).map(
            ([type, summary]) => ({
              type: type.replaceAll("_", " "),
              total: summary.count,
              sold: summary.sold,
              revenue: summary.revenue,
            }),
          )}
          registrationsConfirmed={registrationConfirmed}
          registrationsTotal={event.registrations.length}
          ticketsSold={event.ticketsSold}
          networkingAccepted={networkingAccepted}
          networkingTotal={event.networkingRequests.length}
          sponsorsCount={event.sponsors.length}
          exposantsCount={event.exposants.length}
          sessionsCount={event.sessions.length}
          roomsCount={event.rooms.length}
          totalRevenue={totalTicketRevenue}
        >
          {infoSections}
          {managementUsersCard}
        </EventManagementTabs>
      ) : (
        <>
          {infoSections}
          {attendeeCommunityCard}
        </>
      )}
    </div>
  );
}
