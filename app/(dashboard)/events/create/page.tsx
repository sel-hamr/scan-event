"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  PlusIcon,
  TrashIcon,
  Loader2Icon,
  CalendarIcon,
  Clock3Icon,
  UploadCloudIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const STEPS = [
  { id: 1, name: "Event Details", description: "Basic info" },
  { id: 2, name: "Sessions", description: "Schedule & speakers" },
  { id: 3, name: "Tickets", description: "Pricing & capacity" },
  { id: 4, name: "Sponsors & Exposants", description: "Partners & stands" },
];

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hours = Math.floor(index / 4)
    .toString()
    .padStart(2, "0");
  const minutes = ((index % 4) * 15).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
});

function parseDateValue(value: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function TimePickerSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(val: string | null) => onChange(val || "")}
    >
      <SelectTrigger className="rounded-xl w-full">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent className="max-h-64 rounded-xl">
        {TIME_OPTIONS.map((timeOption) => (
          <SelectItem key={timeOption} value={timeOption}>
            {timeOption}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Forms states
  const [eventDetails, setEventDetails] = useState({
    title: "",
    dateStart: "",
    dateEnd: "",
    status: "DRAFT",
    location: "",
    companyId: "",
    description: "",
    banner: "",
  });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setEventDetails((prev) => ({ ...prev, banner: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const [sessions, setSessions] = useState<
    {
      title: string;
      speaker: string;
      start: string;
      end: string;
      description: string;
    }[]
  >([]);
  const [tickets, setTickets] = useState<
    { type: string; price: string; capacity: string }[]
  >([]);
  const [companies, setCompanies] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [speakers, setSpeakers] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [sponsors, setSponsors] = useState<
    Array<{ id: string; name: string; company: string; tier: string }>
  >([]);
  const [exposants, setExposants] = useState<
    Array<{ id: string; name: string; company: string; standNumber: string }>
  >([]);
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    role: string;
    companyId: string | null;
  } | null>(null);
  const [selectedExposantIds, setSelectedExposantIds] = useState<string[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const response = await fetch("/api/options", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      setCompanies(payload.companies || []);
      setSpeakers(payload.speakers || []);
      setSponsors(payload.sponsors || []);
      setExposants(payload.exposants || []);
      if (payload.currentUser) {
        setCurrentUser(payload.currentUser);
        if (
          payload.currentUser.role === "ORGANISATEUR" &&
          payload.currentUser.companyId
        ) {
          setEventDetails((prev) => ({
            ...prev,
            companyId: payload.currentUser.companyId,
          }));
        }
      }
    };

    loadOptions();
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSession = () =>
    setSessions([
      ...sessions,
      { title: "", speaker: "", start: "", end: "", description: "" },
    ]);
  const removeSession = (index: number) =>
    setSessions(sessions.filter((_, i) => i !== index));
  const updateSession = (index: number, field: string, value: string) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setSessions(newSessions);
  };

  const addTicket = () =>
    setTickets([...tickets, { type: "", price: "", capacity: "" }]);
  const removeTicket = (index: number) =>
    setTickets(tickets.filter((_, i) => i !== index));
  const updateTicket = (index: number, field: string, value: string) => {
    const newTickets = [...tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTickets(newTickets);
  };

  const handlePublish = async () => {
    const effectiveCompanyId =
      currentUser?.role === "ORGANISATEUR"
        ? (currentUser.companyId ?? "")
        : eventDetails.companyId;

    if (!effectiveCompanyId) {
      toast.error("Please select a company before publishing the event.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventDetails,
          companyId: effectiveCompanyId,
          banner: eventDetails.banner || undefined,
          sessions,
          tickets,
          sponsorIds: selectedSponsorIds,
          exposantIds: selectedExposantIds,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Failed to create event");
      }

      toast.success("Event created successfully.");
      router.push("/events");
      router.refresh();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSponsorSelection = (id: string) => {
    setSelectedSponsorIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const toggleExposantSelection = (id: string) => {
    setSelectedExposantIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/events">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
          <p className="text-muted-foreground">
            Set up a new event, manage sessions, and create ticket tiers.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative mb-8">
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 flex items-center px-10 pointer-events-none">
          <div className="w-full border-t-2 border-muted"></div>
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 bg-background px-4"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-muted bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2Icon className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Future of Design Conference"
                  className="rounded-xl"
                  value={eventDetails.title}
                  onChange={(e) =>
                    setEventDetails({ ...eventDetails, title: e.target.value })
                  }
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="date-start">Start Date</Label>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        id="date-start"
                        variant="outline"
                        className={cn(
                          "w-full justify-start rounded-xl text-left font-normal",
                          !eventDetails.dateStart && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventDetails.dateStart
                          ? format(
                              parseDateValue(eventDetails.dateStart) ||
                                new Date(eventDetails.dateStart),
                              "PPP",
                            )
                          : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseDateValue(eventDetails.dateStart)}
                        onSelect={(date) =>
                          setEventDetails({
                            ...eventDetails,
                            dateStart: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date-end">End Date</Label>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        id="date-end"
                        variant="outline"
                        className={cn(
                          "w-full justify-start rounded-xl text-left font-normal",
                          !eventDetails.dateEnd && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventDetails.dateEnd
                          ? format(
                              parseDateValue(eventDetails.dateEnd) ||
                                new Date(eventDetails.dateEnd),
                              "PPP",
                            )
                          : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseDateValue(eventDetails.dateEnd)}
                        onSelect={(date) =>
                          setEventDetails({
                            ...eventDetails,
                            dateEnd: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="grid gap-2 w-full">
                  <Label htmlFor="status">Event Status</Label>
                  <Select
                    value={eventDetails.status}
                    onValueChange={(value: string | null) =>
                      setEventDetails({
                        ...eventDetails,
                        status: value || "DRAFT",
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl w-full" id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location or URL</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA or Zoom Link"
                    className="rounded-xl"
                    value={eventDetails.location}
                    onChange={(e) =>
                      setEventDetails({
                        ...eventDetails,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                {currentUser?.role === "SUPER_ADMIN" && (
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="company">Company</Label>
                    <Select
                      value={eventDetails.companyId}
                      onValueChange={(val: string | null) =>
                        setEventDetails({
                          ...eventDetails,
                          companyId: val || "",
                        })
                      }
                    >
                      <SelectTrigger className="rounded-xl w-full" id="company">
                        {eventDetails.companyId ? (
                          <span className="flex flex-1 text-left text-sm">
                            {companies.find(
                              (c) => c.id === eventDetails.companyId,
                            )?.name ?? eventDetails.companyId}
                          </span>
                        ) : (
                          <span className="flex flex-1 text-left text-sm text-muted-foreground">
                            Select a company
                          </span>
                        )}
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  className="min-h-32 rounded-xl"
                  value={eventDetails.description}
                  onChange={(e) =>
                    setEventDetails({
                      ...eventDetails,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Avatar / Banner upload */}
              <div className="grid gap-2">
                <Label>Event Avatar / Banner</Label>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
                {eventDetails.banner ? (
                  <div className="relative w-full overflow-hidden rounded-xl border border-border/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={eventDetails.banner}
                      alt="Event avatar preview"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEventDetails((prev) => ({ ...prev, banner: "" }))
                      }
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-destructive shadow-sm backdrop-blur hover:bg-background"
                      aria-label="Remove image"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-2 right-2 rounded-lg bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-background"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/"))
                        handleAvatarUpload(file);
                    }}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF, WEBP up to any size (stored as base64)
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Sessions */}
          {currentStep === 2 && (
            <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
              {sessions.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground mb-4">
                    No sessions added yet.
                  </p>
                  <Button
                    onClick={addSession}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add First Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sessions.map((session, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden bg-background border-border/50 shadow-none"
                    >
                      <div className="p-4 grid gap-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSession(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        <h4 className="font-semibold text-sm">
                          Session {index + 1}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Session Title</Label>
                            <Input
                              placeholder="e.g. Keynote Speech"
                              className="rounded-xl"
                              value={session.title}
                              onChange={(e) =>
                                updateSession(index, "title", e.target.value)
                              }
                            />
                          </div>
                          <div className="grid gap-2 w-full">
                            <Label>Speaker Name</Label>
                            <Select
                              value={session.speaker}
                              onValueChange={(val: string | null) =>
                                updateSession(index, "speaker", val || "")
                              }
                            >
                              <SelectTrigger className="rounded-xl w-full">
                                {session.speaker ? (
                                  <span className="flex flex-1 text-left text-sm">
                                    {speakers.find(
                                      (s) => s.id === session.speaker,
                                    )?.name ?? session.speaker}
                                  </span>
                                ) : (
                                  <span className="flex flex-1 text-left text-sm text-muted-foreground">
                                    Select a speaker
                                  </span>
                                )}
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {speakers.map((speaker) => (
                                  <SelectItem
                                    key={speaker.id}
                                    value={speaker.id}
                                  >
                                    {speaker.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Brief description of the session..."
                            className="rounded-xl resize-none"
                            value={session.description}
                            onChange={(e) =>
                              updateSession(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Start Time</Label>
                            <div className="flex items-center gap-2">
                              <Clock3Icon className="h-4 w-4 text-muted-foreground" />
                              <TimePickerSelect
                                value={session.start}
                                onChange={(value) =>
                                  updateSession(index, "start", value)
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label>End Time</Label>
                            <div className="flex items-center gap-2">
                              <Clock3Icon className="h-4 w-4 text-muted-foreground" />
                              <TimePickerSelect
                                value={session.end}
                                onChange={(value) =>
                                  updateSession(index, "end", value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button
                    onClick={addSession}
                    variant="outline"
                    className="w-full rounded-xl border-dashed"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Another Session
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Sponsors & Exposants */}
          {currentStep === 4 && (
            <div className="grid gap-8 animate-in slide-in-from-right-4 duration-300">
              {/* Sponsors */}
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Sponsors</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedSponsorIds.length} selected
                    </p>
                  </div>
                  {selectedSponsorIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSponsorIds([])}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {sponsors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No sponsors available.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sponsors.map((sponsor) => {
                      const selected = selectedSponsorIds.includes(sponsor.id);
                      return (
                        <button
                          key={sponsor.id}
                          type="button"
                          onClick={() => toggleSponsorSelection(sponsor.id)}
                          className={cn(
                            "relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border/50 bg-background/30 hover:border-border hover:bg-muted/30",
                          )}
                        >
                          {selected && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckCircle2Icon className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                            {sponsor.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 pr-6">
                            <p className="truncate text-sm font-semibold leading-tight">
                              {sponsor.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {sponsor.company}
                            </p>
                            <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                              {sponsor.tier}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-border/50" />

              {/* Exposants */}
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Exposants</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedExposantIds.length} selected
                    </p>
                  </div>
                  {selectedExposantIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedExposantIds([])}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {exposants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No exposants available.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {exposants.map((exposant) => {
                      const selected = selectedExposantIds.includes(
                        exposant.id,
                      );
                      return (
                        <button
                          key={exposant.id}
                          type="button"
                          onClick={() => toggleExposantSelection(exposant.id)}
                          className={cn(
                            "relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border/50 bg-background/30 hover:border-border hover:bg-muted/30",
                          )}
                        >
                          {selected && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <CheckCircle2Icon className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                            {exposant.company.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 pr-6">
                            <p className="truncate text-sm font-semibold leading-tight">
                              {exposant.company}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {exposant.name}
                            </p>
                            <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                              Stand {exposant.standNumber}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Tickets */}
          {currentStep === 3 && (
            <div className="grid gap-6 animate-in slide-in-from-right-4 duration-300">
              {tickets.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground mb-4">
                    No ticket tiers added yet.
                  </p>
                  <Button
                    onClick={addTicket}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add First Ticket Tier
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {tickets.map((ticket, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden bg-background border-border/50 shadow-none"
                    >
                      <div className="p-4 grid gap-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTicket(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                        <h4 className="font-semibold text-sm">
                          Ticket Tier {index + 1}
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="grid gap-2 w-full">
                            <Label>Ticket Type</Label>
                            <Select
                              value={ticket.type}
                              onValueChange={(val: string | null) =>
                                updateTicket(index, "type", val || "")
                              }
                            >
                              <SelectTrigger className="rounded-xl w-full">
                                <SelectValue placeholder="Select ticket type" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="standard">
                                  Standard
                                </SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="early_bird">
                                  Early Bird
                                </SelectItem>
                                <SelectItem value="free">Free</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              placeholder="e.g. 99"
                              className="rounded-xl"
                              value={ticket.price}
                              onChange={(e) =>
                                updateTicket(index, "price", e.target.value)
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Capacity</Label>
                            <Input
                              type="number"
                              placeholder="e.g. 500"
                              className="rounded-xl"
                              value={ticket.capacity}
                              onChange={(e) =>
                                updateTicket(index, "capacity", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button
                    onClick={addTicket}
                    variant="outline"
                    className="w-full rounded-xl border-dashed"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Another Ticket Tier
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border/50 pt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || isLoading}
            className="rounded-xl"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={isLoading}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 min-w-32"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  Publish Event
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
