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
import { EventStatus } from "@prisma/client";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";
import { getDisplayEventStatus } from "@/lib/event-status";

export const dynamic = "force-dynamic";

type EventsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    category?: string;
    time?: string;
  }>;
};

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const TIME_FILTERS = [
  { label: "Any time", value: "" },
  { label: "Upcoming", value: "upcoming" },
  { label: "This week", value: "this-week" },
  { label: "This month", value: "this-month" },
  { label: "Past", value: "past" },
];

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

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query =
    typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";
  const rawStatus =
    typeof resolvedParams.status === "string"
      ? resolvedParams.status.toUpperCase()
      : "";
  const validStatuses = [
    "DRAFT",
    "PUBLISHED",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
  ];
  const activeStatus = validStatuses.includes(rawStatus) ? rawStatus : "";

  const activeCategory =
    typeof resolvedParams.category === "string"
      ? resolvedParams.category.trim()
      : "";

  const validTimeValues = ["upcoming", "this-week", "this-month", "past"];
  const rawTime =
    typeof resolvedParams.time === "string" ? resolvedParams.time.trim() : "";
  const activeTime = validTimeValues.includes(rawTime) ? rawTime : "";

  const auth = await getAuthFromCookieStore();
  const userId = auth?.userId;
  const userRole = auth?.role;

  const canCreateEvent =
    userRole === "ORGANISATEUR" || userRole === "SUPER_ADMIN";

  const roleWhere =
    userRole === "SUPER_ADMIN"
      ? {}
      : userRole === "ORGANISATEUR" && userId
        ? { organiserId: userId }
        : {
            status: {
              notIn: [EventStatus.DRAFT, EventStatus.CANCELLED],
            },
          };

  const searchWhere = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
          { location: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const now = new Date();

  const statusWhere =
    activeStatus === "DRAFT"
      ? { status: EventStatus.DRAFT }
      : activeStatus === "CANCELLED"
        ? { status: EventStatus.CANCELLED }
        : activeStatus === "PUBLISHED"
          ? {
              status: {
                notIn: [EventStatus.DRAFT, EventStatus.CANCELLED],
              },
              dateStart: { gt: now },
            }
          : activeStatus === "ONGOING"
            ? {
                status: {
                  notIn: [EventStatus.DRAFT, EventStatus.CANCELLED],
                },
                dateStart: { lte: now },
                dateEnd: { gte: now },
              }
            : activeStatus === "COMPLETED"
              ? {
                  status: {
                    notIn: [EventStatus.DRAFT, EventStatus.CANCELLED],
                  },
                  dateEnd: { lt: now },
                }
              : {};

  const categoryWhere = activeCategory
    ? { category: { equals: activeCategory, mode: "insensitive" as const } }
    : {};

  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const timeWhere =
    activeTime === "upcoming"
      ? { dateStart: { gte: now } }
      : activeTime === "this-week"
        ? { dateStart: { gte: now, lte: weekLater } }
        : activeTime === "this-month"
          ? { dateStart: { gte: now, lte: monthLater } }
          : activeTime === "past"
            ? { dateEnd: { lt: now } }
            : {};

  // Fetch distinct categories for filter pills (scoped to role)
  const categoryRows = await prisma.event.findMany({
    where: { AND: [roleWhere, { category: { not: null } }] },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const availableCategories = categoryRows
    .map((r) => r.category as string)
    .filter(Boolean);

  const events = await prisma.event.findMany({
    where: {
      AND: [roleWhere, searchWhere, statusWhere, categoryWhere, timeWhere],
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
          <form
            method="GET"
            action="/events"
            className="relative w-full sm:w-64"
          >
            {activeStatus && (
              <input type="hidden" name="status" value={activeStatus} />
            )}
            {activeCategory && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            {activeTime && (
              <input type="hidden" name="time" value={activeTime} />
            )}
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search events..."
              className="w-full bg-background pl-9 rounded-xl"
            />
          </form>
          {canCreateEvent ? (
            <Button
              render={<Link href="/events/create" />}
              className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          ) : null}
        </div>
      </div>

      {/* Filter rows */}
      <div className="flex flex-col gap-3">
        {/* Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">
            Status
          </span>
          {STATUS_FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (f.value) params.set("status", f.value);
            if (activeCategory) params.set("category", activeCategory);
            if (activeTime) params.set("time", activeTime);
            const href = `/events${params.toString() ? `?${params.toString()}` : ""}`;
            const isActive = activeStatus === f.value;
            return (
              <Link
                key={f.value || "all-status"}
                href={href}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Time */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">
            Time
          </span>
          {TIME_FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (activeStatus) params.set("status", activeStatus);
            if (activeCategory) params.set("category", activeCategory);
            if (f.value) params.set("time", f.value);
            const href = `/events${params.toString() ? `?${params.toString()}` : ""}`;
            const isActive = activeTime === f.value;
            return (
              <Link
                key={f.value || "all-time"}
                href={href}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Category */}
        {availableCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground w-16 shrink-0">
              Category
            </span>
            {[
              { label: "All", value: "" },
              ...availableCategories.map((c) => ({ label: c, value: c })),
            ].map((f) => {
              const params = new URLSearchParams();
              if (query) params.set("q", query);
              if (activeStatus) params.set("status", activeStatus);
              if (activeTime) params.set("time", activeTime);
              if (f.value) params.set("category", f.value);
              const href = `/events${params.toString() ? `?${params.toString()}` : ""}`;
              const isActive = activeCategory === f.value;
              return (
                <Link
                  key={f.value || "all-cat"}
                  href={href}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {f.label || "All"}
                </Link>
              );
            })}
          </div>
        )}

        {/* Clear */}
        {(query || activeStatus || activeCategory || activeTime) && (
          <div>
            <Link
              href="/events"
              className="inline-flex items-center rounded-full border border-destructive/40 bg-destructive/5 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <FilterIcon className="mr-1 h-3 w-3" />
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 py-20 text-center">
          <SearchIcon className="mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No events found
            {query ? ` for “${query}”` : ""}
            {activeStatus
              ? ` with status “${activeStatus.charAt(0) + activeStatus.slice(1).toLowerCase()}”`
              : ""}
          </p>
          {(query || activeStatus || activeCategory || activeTime) && (
            <Link
              href="/events"
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const displayStatus = getDisplayEventStatus(
              event.status,
              event.dateStart,
              event.dateEnd,
              now,
            );
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
              <Card
                key={event.id}
                className="group relative overflow-hidden rounded-2xl border-border/60 bg-card/80 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg"
              >
                <Link
                  href={`/events/${event.id}`}
                  aria-label={`Open event ${event.title}`}
                  className="absolute inset-0 z-10"
                />
                <div className="relative h-36 border-b border-border/50 bg-muted">
                  {event.banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-chart-2/15" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-background/70 to-transparent" />

                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold capitalize",
                        getStatusBadgeVariant(displayStatus),
                      )}
                    >
                      {displayStatus}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
