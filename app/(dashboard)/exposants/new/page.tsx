import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createExposant } from "@/app/actions/exposant-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewExposantPage() {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      dateStart: "desc",
    },
  });

  const hasEvents = events.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/exposants">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add New Exhibitor
          </h1>
          <p className="text-muted-foreground">
            Create a new exhibitor and assign it to an event.
          </p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/30 p-8">
          <CardTitle className="text-xl">Exhibitor Information</CardTitle>
          <CardDescription>
            Fill in the exhibitor details and event assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={createExposant} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4 text-primary" /> Contact Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Sarah Johnson"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <MailIcon className="h-4 w-4 text-primary" /> Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contact@company.com"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <Building2Icon className="h-4 w-4 text-primary" /> Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="e.g. ExpoTech"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="eventId"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4 text-primary" /> Event
              </Label>
              <Select name="eventId" required>
                <SelectTrigger
                  id="eventId"
                  className="w-full h-10 rounded-xl bg-background/50 border-border/50"
                >
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!hasEvents ? (
              <p className="text-sm text-amber-500">
                You need at least one event in the database before adding an
                exhibitor.
              </p>
            ) : null}

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/exposants">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!hasEvents}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 shadow-lg shadow-primary/20"
              >
                Create Exhibitor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
