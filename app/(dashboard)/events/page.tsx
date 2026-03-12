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
  MoreHorizontalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { dateStart: 'desc' }
  });
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
          <Link href="/events/create">
            <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
          >
            <div className="h-32 bg-muted relative border-b border-border/50">
              {/* Placeholder for banner image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent-purple/20 opacity-50"></div>

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

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Event</DropdownMenuItem>
                    <DropdownMenuItem>Manage Tickets</DropdownMenuItem>
                    <DropdownMenuItem>View Attendees</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="absolute bottom-4 left-4">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-background text-foreground shadow-sm min-w-12 h-12 border border-border/50">
                  <span className="text-[10px] font-bold uppercase text-primary leading-none mb-1">
                    {format(new Date(event.dateStart), "MMM")}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {format(new Date(event.dateStart), "dd")}
                  </span>
                </div>
              </div>
            </div>

            <CardHeader className="pt-4 pb-2">
              <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                {event.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 min-h-10">
                {event.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 truncate text-ellipsis overflow-hidden">
                <span className="font-medium">{event.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Tickets Sold
                  </span>
                  <span className="text-sm font-bold">
                    {event.ticketsSold}
                    {event.attendeesCount > 0 ? (
                      <span className="text-muted-foreground font-normal text-xs ml-1">
                        / {event.attendeesCount}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Revenue</span>
                  <span className="text-sm font-bold">
                    ${(event.revenue / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
