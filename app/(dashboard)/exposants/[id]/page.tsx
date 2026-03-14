import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  BuildingIcon,
  CalendarIcon,
  MailIcon,
  MapIcon,
  UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ExposantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const exposant = await prisma.exposant.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          dateStart: true,
          location: true,
        },
      },
    },
  });

  if (!exposant) {
    notFound();
  }

  const relatedExposants = await prisma.exposant.findMany({
    where: {
      name: {
        equals: exposant.name,
        mode: "insensitive",
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          dateStart: true,
          location: true,
        },
      },
    },
  });

  const events = Array.from(
    new Map(
      relatedExposants.map((item) => [item.event.id, item.event]),
    ).values(),
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      <div>
        <Link href="/exposants">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exposants
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
              <BuildingIcon className="h-6 w-6" />
            </div>
            <div className="space-y-2 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                {exposant.company}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  {exposant.name}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MailIcon className="h-4 w-4" />
                  {exposant.email}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Exposant Events ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events found.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="rounded-xl border border-border/50 bg-background/70 p-4 transition-colors hover:bg-muted/30">
                    <p className="font-semibold line-clamp-1">{event.title}</p>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(event.dateStart).toLocaleDateString()}
                      </p>
                      <p className="inline-flex items-center gap-1.5">
                        <MapIcon className="h-3.5 w-3.5" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
