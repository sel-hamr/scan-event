import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  BuildingIcon,
  CalendarIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type ExposantsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function ExposantsPage({
  searchParams,
}: ExposantsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query =
    typeof resolvedSearchParams?.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";

  const exposants = await prisma.exposant.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { standNumber: { contains: query, mode: "insensitive" } },
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
    orderBy: {
      company: "asc",
    },
  });

  const groupedExposants = Array.from(
    exposants.reduce(
      (acc, exposant) => {
        const key = exposant.name.trim().toLowerCase();
        const existing = acc.get(key);

        if (!existing) {
          acc.set(key, {
            id: exposant.id,
            name: exposant.name,
            email: exposant.email,
            company: exposant.company,
            events: [exposant.event],
          });
          return acc;
        }
        existing.events.push(exposant.event);
        return acc;
      },
      new Map<
        string,
        {
          id: string;
          name: string;
          email: string;
          company: string;
          events: Array<{ id: string; title: string }>;
        }
      >(),
    ),
  ).map(([, item]) => ({
    ...item,
    events: Array.from(
      new Map(item.events.map((event) => [event.id, event])).values(),
    ),
  }));

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exposants</h1>
          <p className="text-muted-foreground">
            Manage exhibitors and their linked events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/exposants" className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search exhibitor or stand..."
              className="w-full bg-background pl-9 rounded-xl"
            />
          </form>
          <Link href="/exposants/new">
            <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Exhibitor
            </Button>
          </Link>
        </div>
      </div>

      {groupedExposants.length === 0 ? (
        <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {query
                ? "No exposants found for this search."
                : "No exposants yet. Add your first exhibitor."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {groupedExposants.map((exp) => (
            <Link key={exp.id} href={`/exposants/${exp.id}`} className="group">
              <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                      <BuildingIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {exp.company}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <UserIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{exp.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <MailIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{exp.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Events ({exp.events.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.events.map((event) => (
                        <Badge
                          key={event.id}
                          variant="outline"
                          className="rounded-lg bg-background/70"
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 text-xs text-primary font-medium">
                    View details
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end px-1 text-sm text-muted-foreground">
        Showing {groupedExposants.length} unique exposants
      </div>
    </div>
  );
}
