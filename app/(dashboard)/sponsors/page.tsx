import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSponsor } from "@/app/actions/sponsor-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  Award,
  Building2,
  Calendar,
  ArrowUpRight,
  MoreHorizontalIcon,
  Star
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const dynamic = "force-dynamic";

type SponsorsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

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
      return "from-slate-400/20";
    case "gold":
      return "from-amber-500/20";
    case "silver":
      return "from-slate-500/20";
    case "bronze":
      return "from-orange-700/20";
    default:
      return "from-primary/20";
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

export default async function SponsorsPage({
  searchParams,
}: SponsorsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";

  const isTierSearch = ["PLATINUM", "GOLD", "SILVER", "BRONZE"].includes(query.toUpperCase());

  const sponsors = await prisma.sponsor.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            ...(isTierSearch ? [{ tier: query.toUpperCase() as any }] : []),
            {
              event: {
                is: {
                  title: { contains: query, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : undefined,
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [{ tier: "asc" }, { company: "asc" }],
  });

  const totalSponsors = sponsors.length;
  const topTierSponsors = sponsors.filter(s => s.tier === 'PLATINUM' || s.tier === 'GOLD').length;
  const uniqueEvents = new Set(sponsors.map(s => s.eventId)).size;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage your event partners, premium sponsors, and their tiers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sponsors/new">
            <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Sponsor
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Partners</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSponsors}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-blue-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                Across all tiers
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Premium Sponsors</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topTierSponsors}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-amber-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                Platinum & Gold
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sponsored Events</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With active sponsorships
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/30 p-2 rounded-2xl border border-border/50 backdrop-blur-sm">
        <form action="/sponsors" method="GET" className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search sponsors by name, company, tier..."
            className="w-full bg-background/50 pl-9 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 text-sm"
          />
        </form>
        <div className="flex items-center gap-2 w-full sm:w-auto px-2 pb-2 sm:p-0">
          <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-lg border-border/50 h-9">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Grid */}
      {sponsors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <Award className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No sponsors found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            {query ? "Try adjusting your search query." : "You haven't partnered with any sponsors yet. Get started by adding a sponsor."}
          </p>
          {!query && (
            <Link href="/sponsors/new" className="mt-4">
              <Button variant="secondary" className="rounded-xl">Add Sponsor</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => {
            const initials = sponsor.company.substring(0, 2).toUpperCase();
            const glowClass = getTierGlow(sponsor.tier);
            
            return (
              <Card
                key={sponsor.id}
                className={cn(
                  "overflow-hidden rounded-2xl bg-card/40 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col relative border-2",
                  sponsor.tier.toLowerCase() === "platinum"
                    ? "border-slate-500/30 hover:border-slate-400/50 hover:shadow-slate-500/10"
                    : sponsor.tier.toLowerCase() === "gold"
                      ? "border-amber-500/30 hover:border-amber-400/50 hover:shadow-amber-500/10"
                      : sponsor.tier.toLowerCase() === "silver"
                        ? "border-slate-400/30 hover:border-slate-300/50 hover:shadow-slate-400/10"
                        : "border-orange-700/30 hover:border-orange-600/50 hover:shadow-orange-700/10"
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", glowClass)} />
                
                <CardHeader className="pt-6 pb-4 relative z-10 flex flex-row items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner group-hover:scale-105 transition-transform duration-300",
                      sponsor.tier.toLowerCase() === "platinum" ? "bg-gradient-to-br from-slate-400/20 to-slate-400/5 border-slate-400/20" :
                      sponsor.tier.toLowerCase() === "gold" ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20" :
                      sponsor.tier.toLowerCase() === "silver" ? "bg-gradient-to-br from-slate-500/20 to-slate-500/5 border-slate-500/20" :
                      "bg-gradient-to-br from-orange-700/20 to-orange-700/5 border-orange-700/20"
                    )}>
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.company}
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <span className={cn(
                          "text-lg font-bold tracking-wider",
                          sponsor.tier.toLowerCase() === "platinum" ? "text-slate-300" :
                          sponsor.tier.toLowerCase() === "gold" ? "text-amber-500" :
                          sponsor.tier.toLowerCase() === "silver" ? "text-slate-400" :
                          "text-orange-600"
                        )}>
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 pr-6">
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        <Link href={`/sponsors/${sponsor.id}`} className="after:absolute after:inset-0">
                          {sponsor.company}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-1 text-xs">
                        {sponsor.name}
                      </CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground relative z-20"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl z-50">
                      <DropdownMenuItem>
                        <Link href={`/sponsors/${sponsor.id}`} className="w-full cursor-pointer">
                          View Sponsor
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          href={`/sponsors/${sponsor.id}/edit`}
                          className="w-full cursor-pointer"
                        >
                          Edit Sponsor
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                        <form action={deleteSponsor.bind(null, sponsor.id)} className="w-full">
                          <button type="submit" className="w-full text-left cursor-pointer">
                            Remove Sponsor
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <div className="px-6 py-2 flex-col gap-2 relative z-10 hidden">
                    {/* Extra space if needed for future fields */}
                </div>

                <div className="mt-auto p-4 border-t border-border/30 bg-muted/5 flex justify-between items-center relative z-10">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg border",
                    getTierColor(sponsor.tier)
                  )}>
                    {getTierIcon(sponsor.tier)}
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {sponsor.tier}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 max-w-[50%]">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground truncate group-hover:text-foreground transition-colors">
                      {sponsor.event.title}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

