import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QrCodeIcon, TicketIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
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
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

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
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20 text-center">QR</TableHead>
                  <TableHead className="min-w-50">Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell className="text-center">
                      <Link href={`/tickets/mine/${ticket.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                        >
                          <QrCodeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/events/${ticket.event.id}`}
                          className="text-sm font-medium leading-none transition-colors hover:text-primary"
                        >
                          {ticket.event.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {ticket.event.location}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {ticket.id}
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
                          "text-xs font-semibold uppercase",
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
                          getStatusVariant(ticket.status),
                        )}
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/tickets/mine/${ticket.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg"
                        >
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-end px-6 py-4 border-t border-border/50 text-sm text-muted-foreground">
            Showing {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
