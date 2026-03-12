"use client";

import { mockCompanies, mockEvents } from "@/lib/mock-data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  SearchIcon,
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "draft":
      return "bg-muted text-muted-foreground border-border";
    case "ongoing":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "completed":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "cancelled":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-foreground border-border";
  }
};

export default function CompanyDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const company = mockCompanies.find((c) => c.id === id);
  const companyEvents = mockEvents.filter((e) => e.company_id === id);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">Company Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The company you are looking for does not exist or has been removed.
        </p>
        <Link href="/companies">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  const totalAttendees = companyEvents.reduce(
    (acc, event) => acc + event.attendees_count,
    0,
  );
  const totalRevenue = companyEvents.reduce(
    (acc, event) => acc + event.revenue,
    0,
  );

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500 pb-10">
      {/* Header & Back button */}
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/companies">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Companies
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {company.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {company.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl">
                Edit Company
              </Button>
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Company Info Box */}
        <Card className="md:col-span-1 rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Company Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.address && (
              <div className="flex gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/90">{company.address}</span>
              </div>
            )}
            {company.email && (
              <div className="flex gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/90">{company.email}</span>
              </div>
            )}
            {company.website && (
              <div className="flex gap-3 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="flex gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/90">{company.phone}</span>
              </div>
            )}
            {company.created_at && (
              <div className="flex gap-3 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground/90">
                  Joined {format(new Date(company.created_at), "MMMM yyyy")}
                </span>
              </div>
            )}

            <div className="pt-4 mt-2 border-t border-border/50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Events
                </p>
                <p className="text-xl font-bold">{companyEvents.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Attendees
                </p>
                <p className="text-xl font-bold">
                  {totalAttendees.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Revenue
                </p>
                <p className="text-xl font-bold text-emerald-500">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Events Organized</h2>
            <div className="relative w-full sm:w-64 max-w-[200px]">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter events..."
                className="w-full bg-background pl-9 rounded-xl h-9 text-sm"
              />
            </div>
          </div>

          {companyEvents.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-border/60 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Events Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This company hasn't organized any events yet.
                </p>
                <Button size="sm" className="rounded-xl">
                  Create their first event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {companyEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md group flex flex-col"
                >
                  <div className="h-28 bg-muted relative border-b border-border/50 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent-purple/20 opacity-50"></div>

                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-semibold capitalize",
                          getStatusBadgeVariant(event.status),
                        )}
                      >
                        {event.status}
                      </Badge>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-background text-foreground shadow-sm min-w-10 border border-border/50">
                        <span className="text-[9px] font-bold uppercase text-primary leading-none mb-1">
                          {format(new Date(event.date_start), "MMM")}
                        </span>
                        <span className="text-sm font-bold leading-none">
                          {format(new Date(event.date_start), "dd")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pt-3 pb-2 px-4">
                    <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/events/${event.id}`}>{event.title}</Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-4 pb-4 flex-1 flex flex-col justify-end">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 truncate text-ellipsis overflow-hidden">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="font-medium truncate">
                        {event.location}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground">
                          Tickets Sold
                        </span>
                        <span className="text-sm font-bold">
                          {event.tickets_sold}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground">
                          Revenue
                        </span>
                        <span className="text-sm font-bold">
                          ${(event.revenue / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
