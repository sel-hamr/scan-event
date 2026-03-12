"use client";

import { mockSpeakers } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, FilterIcon, MoreHorizontalIcon, MailIcon, MicIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SpeakersPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Speakers</h1>
          <p className="text-muted-foreground">Manage your event speakers, keynotes, and panelists.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search speakers..." className="w-full bg-background pl-9 rounded-xl" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Button className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Speaker
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockSpeakers.map((speaker) => (
          <Card key={speaker.id} className="overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-md group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage src={speaker.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {speaker.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit Speaker</DropdownMenuItem>
                    <DropdownMenuItem>Assign to Session</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Remove Speaker</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors cursor-pointer">{speaker.name}</h3>
                <p className="text-sm font-medium text-muted-foreground">{speaker.bio}</p>
                <p className="text-[13px] text-muted-foreground/80 flex items-center gap-1.5 mt-1">
                  <MailIcon className="h-3.5 w-3.5" />
                  {speaker.email}
                </p>
              </div>
              
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <MicIcon className="h-3 w-3 text-secondary-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground line-clamp-1">{speaker.topic}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-semibold">
                    {speaker.events_count} {speaker.events_count === 1 ? 'Event' : 'Events'}
                  </span>
                  <span className="text-muted-foreground font-medium">{speaker.company}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
