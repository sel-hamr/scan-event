import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSponsor } from "@/app/actions/sponsor-actions";
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
  HandshakeIcon,
  Building2Icon,
  BadgeCheckIcon,
  ImageIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

const tierOptions = [
  { value: "PLATINUM", label: "Platinum" },
  { value: "GOLD", label: "Gold" },
  { value: "SILVER", label: "Silver" },
  { value: "BRONZE", label: "Bronze" },
];

export default async function NewSponsorPage() {
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
        <Link href="/sponsors">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Sponsor</h1>
          <p className="text-muted-foreground">
            Add a new sponsor and assign it to an event tier.
          </p>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 shadow-xl backdrop-blur rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/30 p-8">
          <CardTitle className="text-xl">Sponsor Information</CardTitle>
          <CardDescription>
            Fill in the sponsor profile and event assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form action={createSponsor} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <HandshakeIcon className="h-4 w-4 text-primary" /> Contact
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. John Turner"
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
                  placeholder="e.g. TechVision"
                  required
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tier"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <BadgeCheckIcon className="h-4 w-4 text-primary" /> Sponsor
                  Tier
                </Label>
                <Select name="tier" required defaultValue="GOLD">
                  <SelectTrigger
                    id="tier"
                    className="w-full h-10 rounded-xl bg-background/50 border-border/50"
                  >
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {tierOptions.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="logo"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4 text-primary" /> Logo URL
                </Label>
                <Input
                  id="logo"
                  name="logo"
                  placeholder="https://example.com/logo.png"
                  className="bg-background/50 border-border/50 rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>

            {!hasEvents ? (
              <p className="text-sm text-amber-500">
                You need at least one event in the database before adding a
                sponsor.
              </p>
            ) : null}

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/sponsors">
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
                Create Sponsor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
