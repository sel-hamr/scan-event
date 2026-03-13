import Link from "next/link";
import { cookies } from "next/headers";
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
} from "lucide-react";

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

export default async function NetworkingUsersPage({
  searchParams,
}: UsersPageProps) {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("userId")?.value;
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

    if (current === "CONNECTED") {
      continue;
    }

    if (request.status === "ACCEPTED") {
      relationStatusByUserId.set(otherUserId, "CONNECTED");
      continue;
    }

    if (request.status !== "PENDING") {
      continue;
    }

    if (request.senderId === currentUserId) {
      if (current === "NONE") {
        relationStatusByUserId.set(otherUserId, "OUTGOING_PENDING");
      }
      continue;
    }

    relationStatusByUserId.set(otherUserId, "INCOMING_PENDING");
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/networking"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to networking
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Find users</h1>
            <p className="text-muted-foreground">
              Browse all users and search by name, email, or company.
            </p>
          </div>
        </div>

        <form action="/networking/users" className="flex w-full max-w-xl gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search users..."
              className="w-full rounded-xl bg-background pl-9"
            />
          </div>
          <Button type="submit" className="rounded-xl">
            Search
          </Button>
        </form>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
        <span>
          {users.length} {users.length === 1 ? "user" : "users"} found
        </span>
        {query ? <span>Search: {query}</span> : <span>Showing all users</span>}
      </div>

      {users.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UsersIcon className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">No users found</h2>
              <p className="text-sm text-muted-foreground">
                Try another search term or clear the search to see all users.
              </p>
            </div>
            {query ? (
              <Link href="/networking/users">
                <Button variant="outline" className="rounded-xl">
                  Clear search
                </Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-border/50 shadow-sm">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold leading-none">
                        {user.name}
                      </h2>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="h-3.5 w-3.5" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {roleLabels[user.role] ?? user.role}
                  </Badge>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2Icon className="h-4 w-4" />
                    <span>{user.company?.name ?? "No company assigned"}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3 text-center">
                    <div>
                      <p className="text-lg font-semibold leading-none">
                        {user._count.sentRequests}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Sent</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold leading-none">
                        {user._count.receivedRequests}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Received
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold leading-none">
                        {user._count.tickets}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tickets
                      </p>
                    </div>
                  </div>

                  <Link href={`/networking/users/${user.id}`} className="block">
                    <Button variant="outline" className="w-full rounded-xl">
                      View details
                    </Button>
                  </Link>

                  {(() => {
                    const relationStatus =
                      relationStatusByUserId.get(user.id) ?? "NONE";

                    if (relationStatus === "INCOMING_PENDING") {
                      return null;
                    }

                    const isDisabled =
                      relationStatus === "OUTGOING_PENDING" ||
                      relationStatus === "CONNECTED";
                    const label =
                      relationStatus === "OUTGOING_PENDING"
                        ? "Request pending"
                        : relationStatus === "CONNECTED"
                          ? "Already connected"
                          : "Send friend request";

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
