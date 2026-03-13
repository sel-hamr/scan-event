import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Users,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Edit,
  MoreHorizontal
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

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

export default async function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { dateStart: "desc" },
      },
    },
  });

  if (!company) {
    notFound();
  }

  const totalAttendees = company.events.reduce(
    (acc, event) => acc + event.attendeesCount,
    0,
  );
  const totalRevenue = company.events.reduce(
    (acc, event) => acc + event.revenue,
    0,
  );
  
  const initials = company.name.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      
      {/* Navigation */}
      <div>
        <Link href="/companies">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl border border-border/50 bg-card/40 overflow-hidden backdrop-blur-sm shadow-sm group">
        {/* Cover Pattern / Gradient */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative transition-all duration-700 ease-in-out group-hover:via-primary/10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        
        <div className="px-6 sm:px-10 pb-8 pt-0 relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end -mt-12 sm:-mt-16">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-background p-2.5 shrink-0 border border-border/50 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="h-full w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <span className="text-3xl sm:text-4xl font-bold text-primary tracking-wider">{initials}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-2 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {company.name}
            </h1>
            {company.description && (
              <p className="text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
                {company.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 mb-2">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl bg-background/50 backdrop-blur-sm border-border">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon" className="rounded-xl shrink-0 bg-background/50 backdrop-blur-sm border-border">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl z-50">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer">
                    Delete Company
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
          <Card className="rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                {company.address && (
                  <div className="flex gap-3.5 text-sm group/item">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors border border-border/50">
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Address</span>
                      <span className="text-foreground/90 font-medium leading-tight">{company.address}</span>
                    </div>
                  </div>
                )}
                {company.email && (
                  <div className="flex gap-3.5 text-sm group/item">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors border border-border/50">
                      <Mail className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Email</span>
                      <a href={`mailto:${company.email}`} className="text-foreground/90 font-medium hover:text-primary transition-colors">
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div className="flex gap-3.5 text-sm group/item">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors border border-border/50">
                      <Phone className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Phone</span>
                      <a href={`tel:${company.phone}`} className="text-foreground/90 font-medium hover:text-primary transition-colors">
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.website && (
                  <div className="flex gap-3.5 text-sm group/item">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors border border-border/50">
                      <Globe className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Website</span>
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline flex items-center gap-1 group-hover/item:gap-1.5 transition-all">
                        {company.website.replace(/^https?:\/\//, "")}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex gap-3 text-sm items-center">
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 border border-border/50">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Member Since</span>
                    <span className="text-foreground font-medium">{format(new Date(company.createdAt), "MMMM yyyy")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex flex-col justify-center items-center text-center gap-2 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-1 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-bold">{totalAttendees.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Attendees</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex flex-col justify-center items-center text-center gap-2 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-1 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-bold text-emerald-500">${(totalRevenue / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Events Organized
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing {company.events.length} event{company.events.length === 1 ? "" : "s"} hosted by {company.name}
              </p>
            </div>
            <Link href="/events/create">
              <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </Link>
          </div>

          {company.events.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-border/60 bg-muted/20 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Events Found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  This company hasn't organized any events yet. Create their first event to help them get started.
                </p>
                <Link href="/events/create">
                  <Button className="rounded-xl">Create First Event</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {company.events.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 group flex flex-col relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="h-28 bg-muted relative border-b border-border/50 shrink-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0 transition-opacity group-hover:opacity-80" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0" />
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold capitalize backdrop-blur-md bg-background/80 shadow-sm border-border/50",
                          getStatusBadgeVariant(event.status),
                        )}
                      >
                        {event.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pt-4 pb-2 px-5 relative z-10">
                    <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/events/${event.id}`} className="after:absolute after:inset-0">
                        {event.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs mt-1.5">
                      <CalendarIcon className="h-3 w-3 shrink-0" />
                      {format(new Date(event.dateStart), "MMM d, yyyy")}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-end relative z-10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 truncate text-ellipsis overflow-hidden">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="font-medium truncate">
                        {event.location}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/30 mt-auto bg-muted/10 -mx-5 px-5 -mb-5 pb-4 group-hover:bg-primary/[0.02] transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                          Tickets Sold
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary/70" />
                          <span className="text-sm font-bold">
                            {event.ticketsSold}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                          Revenue
                        </span>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500/70" />
                          <span className="text-sm font-bold text-emerald-500">
                            ${(event.revenue / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
