import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeftIcon,
  Building2Icon,
  UserIcon,
  AwardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default async function SponsorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sponsor = await prisma.sponsor.findUnique({
    where: { id },
  });

  if (!sponsor) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-in fade-in duration-500 pb-10">
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
          <h1 className="text-2xl font-bold tracking-tight">Sponsor Details</h1>
          <p className="text-muted-foreground">
            View sponsor profile and current tier.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>{sponsor.company}</CardTitle>
          <CardDescription>{sponsor.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-xl">
              <AvatarImage src={sponsor.logo || undefined} />
              <AvatarFallback className="bg-background text-foreground text-xl font-bold border border-border/50">
                {sponsor.company.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <Badge
              variant="outline"
              className={cn("uppercase", getTierColor(sponsor.tier))}
            >
              <AwardIcon className="h-3.5 w-3.5 mr-1" />
              {sponsor.tier.toLowerCase()}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Contact Name</p>
              <p className="font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                {sponsor.name}
              </p>
            </div>

            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Company</p>
              <p className="font-medium flex items-center gap-2">
                <Building2Icon className="h-4 w-4 text-primary" />
                {sponsor.company}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href={`/sponsors/${sponsor.id}/edit`}>
              <Button className="rounded-xl">Edit Sponsor</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
