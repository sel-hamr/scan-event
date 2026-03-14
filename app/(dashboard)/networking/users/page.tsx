import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SendFriendRequestButton } from "@/components/send-friend-request-button";
import {
  SearchIcon,
  UsersIcon,
  Building2Icon,
  MailIcon,
  ArrowLeftIcon,
  UserCheckIcon,
  ClockIcon,
  TicketIcon,
  ChevronRightIcon,
  NetworkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

type UsersPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

const roleLabels: Record<string, string> = {
  PARTICIPANT: "Participant",
  ORGANISATEUR: "Organizer",
  SCANNER: "Scanner",
  EXPOSANT: "Exhibitor",
  SPEAKER: "Speaker",
  SUPER_ADMIN: "Super Admin",
};

const roleColors: Record<string, string> = {
  PARTICIPANT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ORGANISATEUR: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  SCANNER: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  EXPOSANT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SPEAKER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  SUPER_ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const roleEmojis: Record<string, string> = {
  PARTICIPANT: "🎟️",
  ORGANISATEUR: "🎯",
  SCANNER: "📡",
  EXPOSANT: "🏢",
  SPEAKER: "🎤",
  SUPER_ADMIN: "👑",
};

const avatarGradients = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-amber-700",
  "from-rose-500 to-pink-700",
  "from-cyan-500 to-sky-700",
];

function getAvatarGradient(name: string) {
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return avatarGradients[charCode % avatarGradients.length];
}

export default async function NetworkingUsersPage({
  searchParams,
}: UsersPageProps) {
  const auth = await getAuthFromCookieStore();
  const currentUserId = auth?.userId;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";

  const users = await prisma.user.findMany({
    where: {
      ...(currentUserId ? { id: { not: currentUserId } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              {
                company: {
                  is: {
                    name: { contains: query, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          sentRequests: true,
          receivedRequests: true,
          tickets: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  });

  const userIds = users.map((user) => user.id);
  const existingRequests =
    currentUserId && userIds.length > 0
      ? await prisma.networkingRequest.findMany({
          where: {
            OR: [
              {
                senderId: currentUserId,
                receiverId: { in: userIds },
              },
              {
                senderId: { in: userIds },
                receiverId: currentUserId,
              },
            ],
          },
          select: {
            senderId: true,
            receiverId: true,
            status: true,
          },
        })
      : [];

  const relationStatusByUserId = new Map<
    string,
    "INCOMING_PENDING" | "OUTGOING_PENDING" | "CONNECTED" | "NONE"
  >();

  for (const user of users) {
    relationStatusByUserId.set(user.id, "NONE");
  }

  for (const request of existingRequests) {
    const otherUserId =
      request.senderId === currentUserId
        ? request.receiverId
        : request.senderId;
    const current = relationStatusByUserId.get(otherUserId) ?? "NONE";

    if (current === "CONNECTED") continue;

    if (request.status === "ACCEPTED") {
      relationStatusByUserId.set(otherUserId, "CONNECTED");
      continue;
    }

    if (request.status !== "PENDING") continue;

    if (request.senderId === currentUserId) {
      if (current === "NONE") {
        relationStatusByUserId.set(otherUserId, "OUTGOING_PENDING");
      }
      continue;
    }

    relationStatusByUserId.set(otherUserId, "INCOMING_PENDING");
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/networking"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to networking
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Find People</h1>
            <p className="text-muted-foreground mt-1">
              Browse and connect with attendees, speakers, and organizers.
            </p>
          </div>
        </div>

        <form action="/networking/users" className="flex w-full max-w-lg gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="networking-users-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by name, email, or company…"
              className="w-full rounded-xl bg-background pl-9 h-11"
            />
          </div>
          <Button type="submit" className="rounded-xl h-11 px-5 shrink-0">
            Search
          </Button>
        </form>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card/40 px-5 py-3 text-sm backdrop-blur">
        <div className="flex items-center gap-2 text-muted-foreground">
          <NetworkIcon className="h-4 w-4" />
          <span>
            <span className="font-semibold text-foreground">
              {users.length}
            </span>{" "}
            {users.length === 1 ? "person" : "people"} found
          </span>
        </div>
        {query && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Filtering:{" "}
              <span className="font-medium text-foreground">
                &quot;{query}&quot;
              </span>
            </span>
            <Link href="/networking/users">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg text-xs"
              >
                Clear
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Empty state */}
      {users.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UsersIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold">No users found</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try a different search term or clear the filter to browse
                everyone.
              </p>
            </div>
            {query && (
              <Link href="/networking/users">
                <Button variant="outline" className="rounded-xl mt-2">
                  Clear search
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => {
            const relationStatus =
              relationStatusByUserId.get(user.id) ?? "NONE";
            const gradient = getAvatarGradient(user.name);
            const initials = user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={user.id}
                className="group relative flex flex-col rounded-3xl border border-border/50 bg-card/60 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-border/80 overflow-hidden"
              >
                {/* Top accent gradient strip */}
                <div
                  className={cn(
                    "h-1 w-full bg-gradient-to-r opacity-70",
                    gradient,
                  )}
                />

                <div className="flex flex-col flex-1 p-6 gap-5">
                  {/* Avatar + Name row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-border/30 shadow-md ring-2 ring-background">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback
                            className={cn(
                              "bg-gradient-to-br text-white text-sm font-bold",
                              gradient,
                            )}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Connection status dot */}
                        {relationStatus === "CONNECTED" && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                        )}
                        {relationStatus === "OUTGOING_PENDING" && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-background" />
                        )}
                        {relationStatus === "INCOMING_PENDING" && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-background animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h2 className="font-bold text-base leading-none tracking-tight truncate group-hover:text-primary transition-colors">
                          {user.name}
                        </h2>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MailIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        roleColors[user.role] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {roleEmojis[user.role]}{" "}
                      {roleLabels[user.role] ?? user.role}
                    </Badge>
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {user.company?.name ?? "No company"}
                    </span>
                  </div>

                  {/* Stats strip */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/40 bg-muted/20 p-3 text-center">
                    <div>
                      <p className="text-base font-bold leading-none tabular-nums">
                        {user._count.sentRequests +
                          user._count.receivedRequests}
                      </p>
                      <p className="mt-1 text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        Connections
                      </p>
                    </div>
                    <div className="border-x border-border/30">
                      <p className="text-base font-bold leading-none tabular-nums">
                        {user._count.tickets}
                      </p>
                      <p className="mt-1 text-[9px] uppercase font-semibold tracking-wider text-muted-foreground flex items-center justify-center gap-0.5">
                        <TicketIcon className="h-2.5 w-2.5" /> Tickets
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-center">
                        {relationStatus === "CONNECTED" ? (
                          <UserCheckIcon className="h-4 w-4 text-emerald-500" />
                        ) : relationStatus === "OUTGOING_PENDING" ? (
                          <ClockIcon className="h-4 w-4 text-amber-500" />
                        ) : (
                          <span className="text-base font-bold leading-none text-muted-foreground/30">
                            —
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[9px] uppercase font-semibold tracking-wider text-muted-foreground">
                        Status
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      href={`/networking/users/${user.id}`}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-9 gap-2 text-sm group-hover:border-primary/30 group-hover:text-primary transition-colors"
                      >
                        View Profile
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {(() => {
                      if (relationStatus === "INCOMING_PENDING") return null;

                      const isDisabled =
                        relationStatus === "OUTGOING_PENDING" ||
                        relationStatus === "CONNECTED";
                      const label =
                        relationStatus === "OUTGOING_PENDING"
                          ? "Request Pending"
                          : relationStatus === "CONNECTED"
                            ? "Connected ✓"
                            : "Connect";

                      return (
                        <SendFriendRequestButton
                          receiverId={user.id}
                          receiverName={user.name}
                          disabled={isDisabled}
                          label={label}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
