import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MailIcon,
  MicIcon,
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SpeakersPage() {
  const speakers = await prisma.speaker.findMany({
    orderBy: { name: "asc" },
  });

  const totalSpeakers = speakers.length;
  const totalEvents = speakers.reduce(
    (acc, s) => acc + (s.eventsCount || 0),
    0,
  );
  const uniqueCompanies = new Set(
    speakers.map((s) => s.company).filter(Boolean),
  ).size;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-700 pb-16 relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent -z-10 rounded-3xl blur-3xl" />

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
            <MicIcon className="h-4 w-4" />
            Speaker Directory
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Speakers
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Manage your event speakers, keynotes, and industry experts.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72 group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search speakers..."
              className="w-full bg-background/80 backdrop-blur-sm pl-10 border-border/50 rounded-xl shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl relative z-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-xl bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent relative z-10 transition-all shadow-sm"
          >
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Link href="/speakers/new" className="relative z-10 w-full sm:w-auto">
            <Button className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Speaker
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Registrations",
            value: totalSpeakers,
            icon: UsersIcon,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
          },
          {
            label: "Speaking Engagements",
            value: totalEvents,
            icon: CalendarIcon,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
          },
          {
            label: "Organizations",
            value: uniqueCompanies,
            icon: BriefcaseIcon,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl shadow-sm overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black tabular-nums tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    stat.bg,
                    stat.color,
                    "border",
                    stat.border,
                  )}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {speakers.map((speaker, i) => (
          <Link
            key={speaker.id}
            href={`/speakers/${speaker.id}`}
            className="block"
          >
            <Card
              className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardContent className="p-0 flex flex-col h-full relative z-10">
                {/* Card Header with Top Banner */}
                <div className="h-16 bg-gradient-to-r from-muted to-muted/50 rounded-t-3xl border-b border-border/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent" />
                </div>

                {/* Avatar */}
                <div className="px-6 flex items-end -mt-8 mb-4">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Avatar className="h-16 w-16 border-4 border-card shadow-lg relative bg-card">
                      <AvatarImage
                        src={speaker.avatar || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold">
                        {speaker.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 pb-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors cursor-pointer line-clamp-1 mb-1">
                      {speaker.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
                      <BriefcaseIcon className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {speaker.company || "Independent"}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] opacity-80 leading-relaxed">
                      {speaker.bio || "No professional biography provided."}
                    </p>
                  </div>

                  {/* Topics Tags */}
                  <div className="mb-4 mt-auto">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50 text-xs font-medium text-secondary-foreground transition-colors group-hover:bg-secondary">
                      <MicIcon className="h-3 w-3 text-primary" />
                      <span className="truncate max-w-[150px]">
                        {speaker.topic || "General"}
                      </span>
                    </div>
                  </div>

                  {/* Footer Metrics */}
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                      <MailIcon className="h-4 w-4" />
                      <span className="text-xs truncate max-w-[100px]">
                        {speaker.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-primary/80 group-hover:text-primary transition-colors">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-xs">
                        {speaker.eventsCount || 0} Events
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {speakers.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <MicIcon className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              No speakers found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't added any speakers to your directory yet. Get started
              by adding your first speaker.
            </p>
            <Link href="/speakers/new">
              <Button className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                <PlusIcon className="mr-2 h-4 w-4" /> Add Speaker
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
