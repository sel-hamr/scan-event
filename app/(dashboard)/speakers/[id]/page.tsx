import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  BriefcaseIcon,
  CalendarIcon,
  MailIcon,
  MicIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function SpeakerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const speaker = await prisma.speaker.findUnique({
    where: { id },
  });

  if (!speaker) {
    notFound();
  }

  const initials = speaker.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-in fade-in duration-500">
      <div>
        <Link href="/speakers">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Speakers
          </Button>
        </Link>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/40 shadow-sm backdrop-blur">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <Avatar className="h-24 w-24 border-4 border-card shadow-lg bg-card">
            <AvatarImage
              src={speaker.avatar || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {speaker.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BriefcaseIcon className="h-4 w-4" />
              <span>{speaker.company || "Independent"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/40 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Biography</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {speaker.bio || "No professional biography provided."}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/40 shadow-sm">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span>{speaker.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MicIcon className="h-4 w-4 text-muted-foreground" />
              <span>{speaker.topic || "General"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{speaker.eventsCount || 0} Events</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
