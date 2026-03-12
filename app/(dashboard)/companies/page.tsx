"use client";

import { mockCompanies, mockEvents } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, FilterIcon, MoreHorizontalIcon, Building2, MapPin, Globe, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CompaniesPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage companies that hold and organize events.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search companies..." className="w-full bg-background pl-9 rounded-xl" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockCompanies.map((company) => {
          const companyEvents = mockEvents.filter(e => e.company_id === company.id);
          
          return (
            <Card key={company.id} className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md group flex flex-col">
              <CardHeader className="pt-6 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        <Link href={`/companies/${company.id}`}>{company.name}</Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {company.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                  <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/companies/${company.id}`} className="w-full">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>Edit Company</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete Company</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-2 text-sm text-muted-foreground mt-2">
                  {company.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{company.address}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      <a href={company.website} target="_blank" rel="noreferrer" className="truncate hover:text-primary transition-colors">{company.website.replace(/^https?:\/\//, '')}</a>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium">Events</span>
                  <span className="text-sm font-bold text-foreground">{companyEvents.length}</span>
                </div>
                <Link href={`/companies/${company.id}`}>
                  <Button variant="secondary" size="sm" className="rounded-xl h-8 text-xs font-semibold">
                        View Events
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
