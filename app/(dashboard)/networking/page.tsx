import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  UsersIcon,
  MessageSquareIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NetworkingCardActions } from "@/components/networking-card-actions";

export const dynamic = "force-dynamic";

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-emerald-500/10 text-emerald-500 border-none";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border-none";
    case "rejected":
      return "bg-destructive/10 text-destructive border-none";
    default:
      return "bg-muted text-foreground border-none";
  }
};

export default async function NetworkingPage() {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("userId")?.value;

  const requests = await prisma.networkingRequest.findMany({
    where: {
      ...(currentUserId
        ? {
            OR: [
              {
                receiverId: currentUserId,
                status: "PENDING",
              },
              {
                senderId: currentUserId,
                status: "ACCEPTED",
              },
              {
                receiverId: currentUserId,
                status: "ACCEPTED",
              },
            ],
          }
        : {
            id: {
              in: [],
            },
          }),
    },
    include: {
      sender: true,
      receiver: true,
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Networking</h1>
          <p className="text-muted-foreground">
            Manage connections and connection requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search connections..."
              className="w-full bg-background pl-9 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Link href="/networking/users">
            <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <UsersIcon className="mr-2 h-4 w-4" />
              Find People
            </Button>
          </Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/60 bg-card/30">
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            No pending invitations or accepted connections found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => {
            const contact =
              req.senderId === currentUserId ? req.receiver : req.sender;

            return (
              <Card
                key={req.id}
                className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200"
              >
                <CardContent className="p-5 flex flex-col h-full relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                        <AvatarImage src={contact.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-sm">{contact.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {req.event.title}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl"
                      >
                        <Link href={`/networking/users/${contact.id}`}>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                        </Link>
                        {req.status === "ACCEPTED" && (
                          <DropdownMenuItem>Message Contact</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Remove Connection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-sm mb-4 flex-1">
                    <p className="flex gap-2">
                      <MessageSquareIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/90 italic">
                        {req.message}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                        Status
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0 h-5",
                          getStatusBadgeVariant(req.status),
                        )}
                      >
                        {req.status}
                      </Badge>
                    </div>

                    <NetworkingCardActions
                      requestId={req.id}
                      status={req.status}
                    />
                    {req.status === "REJECTED" && (
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(req.createdAt)}
                      </span>
                    )}
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
