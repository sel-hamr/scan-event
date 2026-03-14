import Link from "next/link";
import { redirect } from "next/navigation";
import { QrCodeIcon, TicketIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default async function MyTicketsPage() {
  const auth = await getAuthFromCookieStore();
  const userId = auth?.userId;
  const userRole = auth?.role;

  if (!userId) {
    redirect("/login");
  }

  if (userRole !== "PARTICIPANT") {
    redirect("/tickets");
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "USED", "CANCELLED", "EXPIRED"],
      },
    },
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
        },
      },
    },
    orderBy: {
      event: {
        dateStart: "desc",
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-muted-foreground">
          All tickets you bought for your events.
        </p>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Tickets</CardTitle>
              <CardDescription>
                {tickets.length} ticket{tickets.length === 1 ? "" : "s"} in your
                account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {tickets.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No tickets found in your account yet.
            </div>
          ) : (
            <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="group relative flex flex-col md:flex-row bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "mb-3 uppercase text-[10px] font-bold tracking-wider",
                            getTicketTypeVariant(ticket.type),
                          )}
                        >
                          {ticket.type.replace("_", " ")}
                        </Badge>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          <Link href={`/events/${ticket.event.id}`}>
                            {ticket.event.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {ticket.event.location}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "uppercase text-[10px] font-bold shrink-0",
                          getStatusVariant(ticket.status),
                        )}
                      >
                        {ticket.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border/30">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">
                          Date
                        </p>
                        <p className="text-sm font-medium">
                          {formatDateTime(ticket.event.dateStart)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">
                          Price
                        </p>
                        <p className="text-sm font-medium">
                          {ticket.price === 0
                            ? "Free"
                            : formatCurrency(ticket.price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative cutouts & divider */}
                  <div className="relative flex md:flex-col justify-center items-center px-4 py-4 md:py-0 bg-muted/20 border-t md:border-t-0 md:border-l border-dashed border-border/50">
                    <div className="absolute top-0 -left-3 md:-top-3 md:left-[50%] md:-translate-x-1/2 w-6 h-6 bg-background rounded-full border border-border/50 -mt-[1px] md:-ml-[1px]"></div>
                    <div className="absolute bottom-0 -left-3 md:-bottom-3 md:left-[50%] md:-translate-x-1/2 w-6 h-6 bg-background rounded-full border border-border/50 -mb-[1px] md:-ml-[1px]"></div>

                    <Link
                      href={`/tickets/mine/${ticket.id}`}
                      className="w-full flex-1 flex flex-col items-center justify-center p-2 gap-3 min-w-[120px]"
                    >
                      <Button
                        variant="secondary"
                        className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                      >
                        View Ticket
                      </Button>
                      <div className="flex flex-col items-center">
                        <QrCodeIcon className="h-8 w-8 text-muted-foreground mb-1 group-hover:text-primary transition-colors duration-300" />
                        <span className="text-[10px] font-mono text-muted-foreground select-all">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 text-sm">
            <span className="text-muted-foreground">
              Showing {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
