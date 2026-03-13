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
  Calendar as CalendarIcon,
  MapPin,
  User as UserIcon,
  Award,
  MoreHorizontal,
  Edit,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Users
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
import { deleteSponsor } from "@/app/actions/sponsor-actions";

export const dynamic = "force-dynamic";

const getTierColor = (tier: string) => {
  switch (tier.toLowerCase()) {
    case "platinum":
      return "text-slate-300 bg-slate-400/10 border-slate-400/30";
    case "gold":
      return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    case "silver":
      return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    case "bronze":
      return "text-orange-600 bg-orange-700/10 border-orange-700/30";
    default:
      return "text-muted-foreground bg-muted border-border/50";
  }
};

const getTierGlow = (tier: string) => {
  switch (tier.toLowerCase()) {
    case "platinum":
      return "from-slate-400/20 to-slate-400/5 via-slate-400/10";
    case "gold":
      return "from-amber-500/20 to-amber-500/5 via-amber-500/10";
    case "silver":
      return "from-slate-500/20 to-slate-500/5 via-slate-500/10";
    case "bronze":
      return "from-orange-700/20 to-orange-700/5 via-orange-700/10";
    default:
      return "from-primary/20 to-primary/5 via-primary/10";
  }
};

const getTierIcon = (tier: string) => {
  switch (tier.toLowerCase()) {
    case "platinum":
      return <Award className="h-4 w-4 text-slate-300" />;
    case "gold":
      return <Award className="h-4 w-4 text-amber-500" />;
    case "silver":
      return <Award className="h-4 w-4 text-slate-400" />;
    case "bronze":
      return <Award className="h-4 w-4 text-orange-600" />;
    default:
      return <Award className="h-4 w-4 text-muted-foreground" />;
  }
};

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

export default async function SponsorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
    include: {
      event: true,
    },
  });

  if (!sponsor) {
    notFound();
  }

  const initials = sponsor.company.substring(0, 2).toUpperCase();
  const event = sponsor.event;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      
      {/* Navigation */}
      <div>
        <Link href="/sponsors">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sponsors
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl border border-border/50 bg-card/40 overflow-hidden backdrop-blur-sm shadow-sm group">
        {/* Cover Pattern / Gradient */}
        <div className={cn("h-32 sm:h-48 w-full bg-gradient-to-br relative transition-all duration-700 ease-in-out", getTierGlow(sponsor.tier))}>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute top-4 right-4 z-20">
            <Badge
              variant="outline"
              className={cn("uppercase backdrop-blur-md bg-background/50 text-[10px] font-bold tracking-widest px-3 py-1 border shadow-sm", getTierColor(sponsor.tier))}
            >
              {getTierIcon(sponsor.tier)}
              <span className="ml-1.5">{sponsor.tier} Partner</span>
            </Badge>
          </div>
        </div>
        
        <div className="px-6 sm:px-10 pb-8 pt-0 relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-end -mt-12 sm:-mt-16">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-background p-2.5 shrink-0 border border-border/50 shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
            <div className={cn("h-full w-full rounded-2xl flex items-center justify-center bg-gradient-to-br", getTierGlow(sponsor.tier))}>
              {sponsor.logo ? (
                <img src={sponsor.logo} alt={sponsor.company} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <span className={cn(
                  "text-3xl sm:text-4xl font-bold tracking-wider",
                  sponsor.tier.toLowerCase() === "platinum" ? "text-slate-300" :
                  sponsor.tier.toLowerCase() === "gold" ? "text-amber-500" :
                  sponsor.tier.toLowerCase() === "silver" ? "text-slate-400" :
                  "text-orange-600"
                )}>{initials}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-2 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {sponsor.company}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
              <UserIcon className="h-4 w-4" />
              Contact: {sponsor.name}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0 mb-2">
            <Link href={`/sponsors/${sponsor.id}/edit`}>
              <Button variant="outline" className="w-full sm:w-auto rounded-xl bg-background/50 backdrop-blur-sm border-border">
                <Edit className="mr-2 h-4 w-4" />
                Edit Sponsor
              </Button>
            </Link>
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
                  <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                    <form action={deleteSponsor.bind(null, sponsor.id)} className="w-full">
                      <button type="submit" className="w-full text-left cursor-pointer">
                        Remove Sponsor
                      </button>
                    </form>
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
                Sponsor Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex gap-3.5 text-sm group/item">
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors border border-border/50">
                    <UserIcon className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Primary Contact</span>
                    <span className="text-foreground/90 font-medium leading-tight">{sponsor.name}</span>
                  </div>
                </div>

                <div className="flex gap-3.5 text-sm group/item">
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors border border-border/50">
                    <Award className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-0.5">Sponsorship Tier</span>
                    <span className={cn("text-foreground/90 font-medium leading-tight capitalize", sponsor.tier.toLowerCase() === 'platinum' ? 'text-slate-300' : sponsor.tier.toLowerCase() === 'gold' ? 'text-amber-500' : sponsor.tier.toLowerCase() === 'silver' ? 'text-slate-400' : 'text-orange-600')}>
                      {sponsor.tier.toLowerCase()} Tier
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Sponsored Event
              </h2>
              <p className="text-sm text-muted-foreground">
                This sponsor is currently partnered with the following event.
              </p>
            </div>
            <Link href={`/events/${event.id}`}>
              <Button size="sm" variant="outline" className="rounded-xl shadow-sm hover:bg-accent">
                <Activity className="mr-2 h-4 w-4" />
                View Event
              </Button>
            </Link>
          </div>

          <Card
            className="overflow-hidden rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 group flex flex-col relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="h-32 bg-muted relative border-b border-border/50 shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0 transition-opacity group-hover:opacity-80" />
              {event.banner && <img src={event.banner} alt={event.title} className="w-full h-full object-cover mix-blend-overlay opacity-50 z-0" />}
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
              <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                <Link href={`/events/${event.id}`} className="after:absolute after:inset-0">
                  {event.title}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-sm mt-1.5">
                <CalendarIcon className="h-4 w-4 shrink-0" />
                {format(new Date(event.dateStart), "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-end relative z-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 truncate text-ellipsis overflow-hidden">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
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
                    <Users className="h-4 w-4 text-primary/70" />
                    <span className="text-base font-bold">
                      {event.ticketsSold}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                    Event Revenue
                  </span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500/70" />
                    <span className="text-base font-bold text-emerald-500">
                      ${(event.revenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
