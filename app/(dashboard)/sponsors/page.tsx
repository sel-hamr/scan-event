import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSponsor } from "@/app/actions/sponsor-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  AwardIcon,
  MoreHorizontalIcon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const getTierIcon = (tier: string) => {
  switch (tier.toLowerCase()) {
    case "platinum":
      return <AwardIcon className="h-5 w-5 text-slate-300" />;
    case "gold":
      return <AwardIcon className="h-5 w-5 text-amber-500" />;
    case "silver":
      return <AwardIcon className="h-5 w-5 text-slate-400" />;
    case "bronze":
      return <AwardIcon className="h-5 w-5 text-orange-600" />;
    default:
      return null;
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

  const sponsors = await prisma.sponsor.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { tier: { equals: query.toUpperCase() as never } },
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

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage your event partners, sponsors, and their tiers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/sponsors" className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search partners..."
              className="w-full bg-background pl-9 rounded-xl"
            />
          </form>
          <Link href="/sponsors/new">
            <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Sponsor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((sponsor) => (
          <Card
            key={sponsor.id}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md border-2",
              sponsor.tier.toLowerCase() === "platinum"
                ? "border-slate-500/30"
                : sponsor.tier.toLowerCase() === "gold"
                  ? "border-amber-500/30"
                  : "border-border/50",
            )}
          >
            {/* Background glow based on tier */}
            <div
              className={cn(
                "absolute inset-0 opacity-[0.03] blur-xl pointer-events-none",
                sponsor.tier.toLowerCase() === "platinum"
                  ? "bg-slate-300"
                  : sponsor.tier.toLowerCase() === "gold"
                    ? "bg-amber-500"
                    : "bg-primary",
              )}
            ></div>

            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarImage src={sponsor.logo || undefined} />
                    <AvatarFallback className="bg-background text-foreground text-lg font-bold border border-border/50">
                      {sponsor.company.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{sponsor.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sponsor.name}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground relative z-10"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem>
                      <Link href={`/sponsors/${sponsor.id}`} className="w-full">
                        View Sponsor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href={`/sponsors/${sponsor.id}/edit`}
                        className="w-full"
                      >
                        Edit Sponsor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <form action={deleteSponsor.bind(null, sponsor.id)}>
                        <button type="submit" className="w-full text-left">
                          Remove Sponsor
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border",
                    getTierColor(sponsor.tier),
                  )}
                >
                  {getTierIcon(sponsor.tier)}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {sponsor.tier.toLowerCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
