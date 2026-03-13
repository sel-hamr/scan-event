import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { EditUserDrawer } from "@/components/networking/edit-user-drawer";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Phone,
  Ticket as TicketIcon,
  Handshake,
  Shield,
  QrCode,
  Globe,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Users,
  Star,
  ExternalLink,
  CircleDollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  PARTICIPANT: "Participant",
  ORGANISATEUR: "Organizer",
  SCANNER: "Scanner",
  EXPOSANT: "Exhibitor",
  SPEAKER: "Speaker",
  SUPER_ADMIN: "Super Admin",
};

const roleColors: Record<string, string> = {
  PARTICIPANT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  ORGANISATEUR: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  SCANNER: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  EXPOSANT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SPEAKER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  SUPER_ADMIN: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const roleGradients: Record<string, string> = {
  PARTICIPANT: "from-blue-500 to-indigo-600",
  ORGANISATEUR: "from-violet-500 to-purple-700",
  SCANNER: "from-orange-500 to-amber-600",
  EXPOSANT: "from-amber-500 to-yellow-600",
  SPEAKER: "from-emerald-500 to-teal-600",
  SUPER_ADMIN: "from-rose-500 to-pink-700",
};

const roleEmojis: Record<string, string> = {
  PARTICIPANT: "🎟️",
  ORGANISATEUR: "🎯",
  SCANNER: "📡",
  EXPOSANT: "🏢",
  SPEAKER: "🎤",
  SUPER_ADMIN: "👑",
};

const getTicketTypeVariant = (type: string) => {
  switch (type.toLowerCase()) {
    case "vip":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "standard":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "early_bird":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "free":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-foreground border-border";
  }
};

const getTicketStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return {
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case "used":
      return {
        cls: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case "cancelled":
      return {
        cls: "bg-destructive/15 text-destructive border-destructive/30",
        icon: <XCircle className="h-3 w-3" />,
      };
    case "expired":
      return {
        cls: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        icon: <Clock className="h-3 w-3" />,
      };
    default:
      return { cls: "bg-muted text-foreground border-none", icon: null };
  }
};

export default async function NetworkingUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          website: true,
        },
      },
      tickets: {
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
              code: true,
              scanned: true,
              scannedAt: true,
            },
            orderBy: {
              scannedAt: "desc",
            },
          },
        },
        orderBy: {
          event: {
            dateStart: "desc",
          },
        },
      },
      organizedEvents: {
        select: {
          id: true,
        },
      },
      registrations: {
        select: {
          id: true,
          status: true,
        },
      },
      sentRequests: {
        select: {
          id: true,
          status: true,
        },
      },
      receivedRequests: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check if the current viewer is a SUPER_ADMIN
  const cookieStore = await cookies();
  const viewerRole = cookieStore.get("userRole")?.value;
  const isSuperAdmin = viewerRole === "SUPER_ADMIN";

  // Fetch all companies for the Organizer company selector
  const allCompanies = isSuperAdmin
    ? await prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const totalSpent = user.tickets.reduce(
    (sum, ticket) => sum + ticket.price,
    0,
  );
  const activeTickets = user.tickets.filter(
    (ticket) => ticket.status === "ACTIVE",
  ).length;
  const usedTickets = user.tickets.filter(
    (ticket) => ticket.status === "USED",
  ).length;
  const acceptedConnections = [
    ...user.sentRequests,
    ...user.receivedRequests,
  ].filter((request) => request.status === "ACCEPTED").length;

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradient = roleGradients[user.role] ?? "from-primary to-primary/70";
  const roleColor = roleColors[user.role] ?? "bg-muted text-muted-foreground";

  const detailRows = [
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: user.email, mono: false },
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: user.phone || "Not provided", mono: false },
    { icon: <Shield className="h-4 w-4" />, label: "Role", value: roleLabels[user.role] ?? user.role, mono: false },
    {
      icon: <Building2 className="h-4 w-4" />,
      label: "Company",
      value: user.company?.name || "No company assigned",
      sub: user.company?.email,
      mono: false,
    },
    ...(user.company?.website
      ? [{ icon: <Globe className="h-4 w-4" />, label: "Website", value: user.company.website, href: user.company.website, mono: false }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700 pb-16 relative">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/10 via-secondary/10 to-transparent -z-10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent/10 to-transparent -z-10 rounded-full blur-[100px]" />
      
      {/* Back button + admin actions */}
      <div className="flex items-center justify-between">
        <Link href="/networking/users">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            All Users
          </Button>
        </Link>

        {isSuperAdmin && (
          <EditUserDrawer
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone ?? null,
              role: user.role,
              avatar: user.avatar ?? null,
              companyId: user.company?.id ?? null,
            }}
            companies={allCompanies}
          />
        )}
      </div>

      {/* ===== HERO PROFILE BANNER ===== */}
      <div className="relative rounded-3xl overflow-hidden border border-border/40 shadow-2xl group transition-all duration-700 hover:shadow-primary/10">
        {/* Animated background gradient */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-1000", gradient)} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_60%)]" />

        {/* Gradient stripe top */}
        <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60", gradient)} />

        {/* Content */}
        <div className="relative p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            {/* Left: avatar + basic info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Avatar with glowing ring */}
              <div className="relative">
                <div className={cn("absolute -inset-1 rounded-full bg-gradient-to-br opacity-40 blur-md", gradient)} />
                <Avatar className="relative h-24 w-24 border-2 border-background shadow-xl ring-2 ring-border/30">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback
                    className={cn("bg-gradient-to-br text-white text-2xl font-black", gradient)}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider", roleColor)}
                    >
                      {roleEmojis[user.role]} {roleLabels[user.role] ?? user.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                </div>

                {user.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{user.company.name}</span>
                    {user.company.website && (
                      <a
                        href={user.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: quick stats */}
            <div className="flex gap-6 sm:gap-8 shrink-0">
              <div className="text-center">
                <p className="text-3xl font-black tabular-nums">{user.tickets.length}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Tickets</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black tabular-nums">{acceptedConnections}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Connections</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black tabular-nums">{formatCurrency(totalSpent)}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Active Tickets",
            value: activeTickets,
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Used Tickets",
            value: usedTickets,
            icon: <TicketIcon className="h-5 w-5" />,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Connections",
            value: acceptedConnections,
            icon: <Handshake className="h-5 w-5" />,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "Organized Events",
            value: user.organizedEvents.length,
            icon: <Star className="h-5 w-5" />,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((kpi, i) => (
          <Card
            key={kpi.label}
            className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:bg-card/60 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
            style={{ animationDelay: `${100 + i * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                <div className={cn("p-2 rounded-xl", kpi.bg, kpi.color)}>
                  {kpi.icon}
                </div>
              </div>
              <p className="text-4xl font-black tabular-nums">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile details sidebar */}
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <Card className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-muted/40 text-muted-foreground shrink-0 mt-0.5">
                    {row.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">
                      {row.label}
                    </p>
                    {row.href ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-primary hover:underline break-all"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <p className={cn("font-medium text-sm break-all", row.mono && "font-mono")}>
                        {row.value}
                      </p>
                    )}
                    {row.sub && (
                      <p className="text-xs text-muted-foreground mt-0.5">{row.sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity summary card */}
          <Card className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Registrations", value: user.registrations.length },
                  { label: "Sent Requests", value: user.sentRequests.length },
                  { label: "Received", value: user.receivedRequests.length },
                  { label: "Organized", value: user.organizedEvents.length },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-muted/20 border border-border/30 p-3 text-center"
                  >
                    <p className="text-2xl font-black tabular-nums">{stat.value}</p>
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket History */}
        <Card className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md shadow-sm lg:col-span-2 animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TicketIcon className="h-4 w-4 text-primary" />
                  Ticket History
                </CardTitle>
                <CardDescription className="mt-1">
                  {user.tickets.length} ticket{user.tickets.length !== 1 ? "s" : ""} · {formatCurrency(totalSpent)} total
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {user.tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
                <div className="p-4 rounded-2xl bg-muted/20 text-muted-foreground">
                  <TicketIcon className="h-8 w-8" />
                </div>
                <p className="text-sm text-muted-foreground">No tickets found for this user.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {user.tickets.map((ticket) => {
                  const latestQrCode = ticket.qrCodes[0];
                  const statusCfg = getTicketStatusConfig(ticket.status);

                  return (
                    <div
                      key={ticket.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-card/80 backdrop-blur-sm transition-all duration-300 group border-b border-transparent hover:border-border/50 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      {/* Left: event info */}
                      <div className="flex items-start gap-4 min-w-0 flex-1 relative z-10">
                        <div className="p-2 rounded-xl bg-muted/30 text-muted-foreground shrink-0">
                          <TicketIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <Link
                            href={`/events/${ticket.event.id}`}
                            className="font-semibold text-sm hover:text-primary transition-colors block truncate"
                          >
                            {ticket.event.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDateTime(ticket.event.dateStart)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {ticket.event.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: badges + price + QR */}
                      <div className="flex items-center gap-3 flex-wrap shrink-0 relative z-10">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider",
                            getTicketTypeVariant(ticket.type),
                          )}
                        >
                          {ticket.type.replace("_", " ")}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-bold gap-1",
                            statusCfg.cls,
                          )}
                        >
                          {statusCfg.icon}
                          {ticket.status}
                        </Badge>

                        <span className="text-sm font-bold tabular-nums">
                          {ticket.price === 0 ? (
                            <span className="text-emerald-400">Free</span>
                          ) : (
                            formatCurrency(ticket.price)
                          )}
                        </span>

                        {latestQrCode && (
                          <div
                            className={cn(
                              "flex items-center gap-1 text-[10px] font-mono rounded-lg px-2 py-1 border",
                              latestQrCode.scanned
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-muted/20 text-muted-foreground border-border/30",
                            )}
                          >
                            <QrCode className="h-3 w-3" />
                            {latestQrCode.scanned ? "Scanned" : "Not scanned"}
                          </div>
                        )}

                        <Link href={`/tickets/${ticket.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-lg text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
