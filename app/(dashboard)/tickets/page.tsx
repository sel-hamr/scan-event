import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchIcon, QrCodeIcon, ArrowRightIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

type TicketsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
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

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: { not: null },
      ...(query
        ? {
            OR: [
              { id: { contains: query, mode: "insensitive" } },
              {
                user: { is: { name: { contains: query, mode: "insensitive" } } },
              },
              {
                user: { is: { email: { contains: query, mode: "insensitive" } } },
              },
              {
                event: {
                  is: { title: { contains: query, mode: "insensitive" } },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
        },
      },
      qrCodes: {
        select: {
          id: true,
          scanned: true,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Manage issued tickets, sales, and QR codes.
          </p>
        </div>
        <form
          action="/tickets"
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search attendee, event, or ticket ID..."
              className="w-full bg-background pl-9 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            className="shrink-0 rounded-xl"
          >
            Search
          </Button>
        </form>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Tickets</CardTitle>
              <CardDescription>
                {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
                {query ? ` matching \"${query}\"` : " across all events"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {tickets.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No tickets found.
            </div>
          ) : (
            <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="group relative flex flex-col md:flex-row bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className={cn("mb-3 uppercase text-[10px] font-bold tracking-wider", getTicketTypeVariant(ticket.type))}>
                          {ticket.type.replace("_", " ")}
                        </Badge>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                          {ticket.event.title}
                        </h3>
                        {ticket.user ? (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={ticket.user.avatar || undefined} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] font-medium">
                                {ticket.user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <Link href={`/networking/users/${ticket.user.id}`} className="text-xs font-medium hover:text-primary transition-colors line-clamp-1">
                              {ticket.user.name}
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] font-medium">UA</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-muted-foreground">Unassigned</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={cn("uppercase text-[10px] font-bold shrink-0", getStatusVariant(ticket.status))}>
                        {ticket.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border/30">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">ID</p>
                        <p className="text-xs font-mono">{ticket.id.slice(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider mb-1">Price</p>
                        <p className="text-sm font-medium">{ticket.price === 0 ? "Free" : formatCurrency(ticket.price)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative cutouts & divider */}
                  <div className="relative flex md:flex-col justify-center items-center px-4 py-4 md:py-0 bg-muted/20 border-t md:border-t-0 md:border-l border-dashed border-border/50">
                    <div className="absolute top-0 -left-3 md:-top-3 md:left-[50%] md:-translate-x-1/2 w-6 h-6 bg-background rounded-full border border-border/50 -mt-[1px] md:-ml-[1px]"></div>
                    <div className="absolute bottom-0 -left-3 md:-bottom-3 md:left-[50%] md:-translate-x-1/2 w-6 h-6 bg-background rounded-full border border-border/50 -mb-[1px] md:-ml-[1px]"></div>
                    
                    <Link href={`/tickets/${ticket.id}`} className="w-full flex-1 flex flex-col items-center justify-center p-2 gap-3 min-w-[120px]">
                      <Button variant="secondary" className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                        Manage
                      </Button>
                      <div className="flex flex-col items-center">
                        <QrCodeIcon className="h-8 w-8 text-muted-foreground mb-1 group-hover:text-primary transition-colors duration-300" />
                        <span className="text-[10px] font-mono text-muted-foreground">Scan</span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 text-sm">
            <span className="text-muted-foreground">Showing {tickets.length} ticket{tickets.length === 1 ? "" : "s"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
