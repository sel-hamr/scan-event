import { prisma } from "@/lib/prisma";
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
  Building2,
  MapPin,
  Globe,
  Mail,
  TrendingUp,
  Briefcase,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";


export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const companies = await prisma.company.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: { events: true },
      },
      events: {
        select: {
          revenue: true,
        }
      }
    },
    orderBy: { name: "asc" },
  });

  const totalCompanies = companies.length;
  const totalEvents = companies.reduce((acc, c) => acc + c._count.events, 0);
  const totalRevenue = companies.reduce(
    (acc, c) => acc + c.events.reduce((sum, e) => sum + e.revenue, 0),
    0
  );

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your network of event organizers and partners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/companies/new">
            <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                Active network
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events Hosted</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 flex items-center">
                <ArrowUpRight className="h-3 w-3" />
                Across all companies
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Partner Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              Generated from events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/30 p-2 rounded-2xl border border-border/50 backdrop-blur-sm">
        <form action="/companies" method="GET" className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder="Search companies by name or description..."
            className="w-full bg-background/50 pl-9 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/50"
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
      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20">
          <Building2 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No companies found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            {q ? "Try adjusting your search query." : "You haven't added any companies yet. Get started by adding your first partner."}
          </p>
          {!q && (
            <Link href="/companies/new" className="mt-4">
              <Button variant="secondary" className="rounded-xl">Add Company</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => {
            const initials = company.name.substring(0, 2).toUpperCase();
            
            return (
              <Card
                key={company.id}
                className="overflow-hidden rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 group flex flex-col relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardHeader className="pt-6 pb-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary tracking-wider">{initials}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                          <Link href={`/companies/${company.id}`} className="after:absolute after:inset-0">
                            {company.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-1 text-xs">
                          {company.description || "No description provided"}
                        </CardDescription>
                      </div>
                    </div>


                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-4 relative z-10">
                  <div className="space-y-2.5 text-sm text-muted-foreground mt-1">
                    {company.address && (
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{company.address}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2.5 relative z-20">
                        <Globe className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate hover:text-primary transition-colors"
                        >
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-4 border-t border-border/30 bg-muted/10 flex justify-between items-center group-hover:bg-primary/5 transition-colors relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center z-20">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {company._count.events} {company._count.events === 1 ? 'Event' : 'Events'}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
