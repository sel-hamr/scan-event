import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

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

export default async function MyEventsPage() {
  const auth = await getAuthFromCookieStore();
  const userId = auth?.userId;
  const userRole = auth?.role;

  if (!userId) {
    redirect("/login");
  }

  if (userRole !== "PARTICIPANT") {
    redirect("/events");
  }

  const events = await prisma.event.findMany({
    where: {
      tickets: {
        some: {
          userId,
          status: {
            in: ["ACTIVE", "USED"],
          },
        },
      },
    },
    include: {
      tickets: {
        where: {
          userId,
          status: {
            in: ["ACTIVE", "USED"],
          },
        },
        select: {
          id: true,
          type: true,
          status: true,
          price: true,
        },
      },
    },
    orderBy: {
      dateStart: "desc",
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
        <p className="text-muted-foreground">
          Events you already joined by buying a ticket.
        </p>
      </div>

      {events.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No purchased events yet</h2>
              <p className="text-sm text-muted-foreground">
                Buy a ticket to see your events here.
              </p>
            </div>
            <Link href="/events">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                Browse events
              </Badge>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const ticketCount = event.tickets.length;
            const totalSpent = event.tickets.reduce(
              (sum, ticket) => sum + ticket.price,
              0,
            );

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group"
              >
                <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="h-32 bg-muted relative border-b border-border/50">
                    <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-accent-purple/20 opacity-50" />

                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold capitalize",
                          getStatusBadgeVariant(event.status),
                        )}
                      >
                        {event.status.toLowerCase()}
                      </Badge>
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
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
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
                          Your Tickets
                        </span>
                        <span className="text-sm font-bold inline-flex items-center gap-1">
                          <Ticket className="h-3.5 w-3.5 text-primary" />
                          {ticketCount}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          You Paid
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(totalSpent)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
