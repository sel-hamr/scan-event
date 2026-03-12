"use client";

import { mockTickets } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, FilterIcon, MoreHorizontalIcon, DownloadIcon, QrCodeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getTicketTypeVariant = (type: string) => {
  switch (type) {
    case 'vip': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'standard': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'early_bird': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'free': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-foreground border-border';
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500/10 text-emerald-500 border-none';
    case 'used': return 'bg-muted text-muted-foreground border-none';
    case 'cancelled': return 'bg-destructive/10 text-destructive border-none';
    case 'expired': return 'bg-purple-500/10 text-purple-500 border-none';
    default: return 'bg-muted text-foreground border-none';
  }
};

export default function TicketsPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Manage issued tickets, sales, and QR codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search attendee name or ID..." className="w-full bg-background pl-9 rounded-xl" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="shrink-0 rounded-xl">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusIcon className="mr-2 h-4 w-4" />
            Issue Ticket
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Tickets</CardTitle>
              <CardDescription>Latest tickets generated across all events</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px] text-center">QR</TableHead>
                  <TableHead className="min-w-[200px]">Attendee</TableHead>
                  <TableHead className="min-w-[200px]">Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                        <QrCodeIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                            {ticket.user_name?.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{ticket.user_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{ticket.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{ticket.event_title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs font-semibold uppercase", getTicketTypeVariant(ticket.type))}>
                        {ticket.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", getStatusVariant(ticket.status))}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end px-6 py-4 border-t border-border/50 text-sm text-muted-foreground">
            Showing 1 to {mockTickets.length} of {mockTickets.length} entries
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
