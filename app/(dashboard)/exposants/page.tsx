"use client";

import { mockExposants } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, FilterIcon, MoreHorizontalIcon, MapIcon, BuildingIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ExposantsPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exposants</h1>
          <p className="text-muted-foreground">Manage exhibitors, booths, and stand allocations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search exhibitor or stand..." className="w-full bg-background pl-9 rounded-xl" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Exhibitor
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="min-w-[200px]">Company / Contact</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Stand Allocation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExposants.map((exp) => (
                  <TableRow key={exp.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <BuildingIcon className="h-5 w-5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.name} &bull; {exp.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{exp.event_title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground font-semibold px-2.5 py-1 rounded-md text-xs">
                        <MapIcon className="h-3 w-3" />
                        Stand {exp.stand_number}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Exhibitor</DropdownMenuItem>
                          <DropdownMenuItem>Change Stand</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end px-6 py-4 border-t border-border/50 text-sm text-muted-foreground">
            Showing 1 to {mockExposants.length} of {mockExposants.length} entries
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
