import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  CalendarDays,
  MapPin,
  Building2,
  User,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cookies } from "next/headers";
import { EventStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
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

const formatPrice = (value: number) => {
  if (value <= 0) return "Free";
  return `$${value.toFixed(0)}`;
};

const formatTicketType = (type: string) => type.toLowerCase().replace("_", " ");

export default async function EventsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  const canCreateEvent =
    userRole === "ORGANISATEUR" || userRole === "SUPER_ADMIN";

  const events = await prisma.event.findMany({
    where:
      userRole === "SUPER_ADMIN"
        ? undefined
        : userRole === "ORGANISATEUR" && userId
          ? { organiserId: userId }
          : {
              status: {
                in: [
                  EventStatus.PUBLISHED,
                  EventStatus.ONGOING,
                  EventStatus.COMPLETED,
                ],
              },
            },
    orderBy: { dateStart: "desc" },
    include: {
      company: {
        select: { name: true },
      },
      organiser: {
        select: { name: true },
      },
    },
  });

  const ticketStatsRows = await prisma.ticket.groupBy({
    by: ["eventId", "type"],
    _min: { price: true },
    _max: { price: true },
  });

  const ticketStatsByEventId = new Map<
    string,
    { typeCount: number; minPrice: number; maxPrice: number; firstType: string }
  >();

  for (const row of ticketStatsRows) {
    const existing = ticketStatsByEventId.get(row.eventId);
    const minPrice = row._min.price ?? 0;
    const maxPrice = row._max.price ?? 0;

    if (!existing) {
      ticketStatsByEventId.set(row.eventId, {
        typeCount: 1,
        minPrice,
        maxPrice,
        firstType: row.type,
      });
      continue;
    }

    ticketStatsByEventId.set(row.eventId, {
      typeCount: existing.typeCount + 1,
      minPrice: Math.min(existing.minPrice, minPrice),
      maxPrice: Math.max(existing.maxPrice, maxPrice),
      firstType: existing.firstType,
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage your conferences, meetups, and workshops.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full bg-background pl-9 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          {canCreateEvent ? (
            <Link href="/events/create">
              <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const ticketStats = ticketStatsByEventId.get(event.id);
          const typeLabel = !ticketStats
            ? "No tickets"
            : ticketStats.typeCount === 1
              ? formatTicketType(ticketStats.firstType)
              : `${ticketStats.typeCount} ticket types`;

          const priceLabel = !ticketStats
            ? "No tickets"
            : ticketStats.minPrice === ticketStats.maxPrice
              ? formatPrice(ticketStats.minPrice)
              : `${formatPrice(ticketStats.minPrice)} - ${formatPrice(ticketStats.maxPrice)}`;

          return (
            <Link href={`/events/${event.id}`} className="group" key={event.id}>
              <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg group">
                <div className="relative h-36 border-b border-border/50 bg-muted">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-chart-2/15" />
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-background/70 to-transparent" />

                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold capitalize",
                        getStatusBadgeVariant(event.status.toLowerCase()),
                      )}
                    >
                      {event.status.toLowerCase()}
                    </Badge>
                    {event.category ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.category}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="flex h-14 min-w-14 flex-col items-center justify-center rounded-xl border border-border/60 bg-background/90 p-2 text-foreground shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-primary leading-none mb-1">
                        {format(new Date(event.dateStart), "MMM")}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {format(new Date(event.dateStart), "dd")}
                      </span>
                    </div>
                  </div>
                </div>

                <CardHeader className="space-y-2 pb-2 pt-4">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-10 text-sm leading-relaxed">
                    {event.description}
                  </CardDescription>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <div className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(event.dateStart), "dd MMM yyyy")} -{" "}
                        {format(new Date(event.dateEnd), "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 truncate">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {event.company?.name ?? "No company"}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">
                        {event.organiser?.name ?? "No organiser"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Ticket className="h-3.5 w-3.5" /> Tickets sold
                        </span>
                        <p className="text-sm font-semibold">
                          {event.ticketsSold}
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            / {event.attendeesCount}
                          </span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" /> Revenue
                        </span>
                        <p className="text-sm font-semibold">
                          ${(event.revenue / 1000).toFixed(1)}k
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Type
                        </span>
                        <p className="text-sm font-semibold capitalize">
                          {typeLabel}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">
                          Price
                        </span>
                        <p className="text-sm font-semibold">{priceLabel}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Capacity filled</span>
                        <span>
                          {event.attendeesCount > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (event.ticketsSold / event.attendeesCount) *
                                    100,
                                ),
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${
                              event.attendeesCount > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (event.ticketsSold /
                                        event.attendeesCount) *
                                        100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
