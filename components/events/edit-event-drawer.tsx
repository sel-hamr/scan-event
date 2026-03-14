"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloudIcon, XCircleIcon } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type EventEditData = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  dateStart: string;
  dateEnd: string;
  companyId: string;
  category: string | null;
  banner: string | null;
  dateEndRegistration: string | null;
  typeTicket: string | null;
  price: number | null;
  sessions: Array<{
    id: string;
    title: string;
    description: string;
    speakerId: string;
    start: string;
    end: string;
  }>;
  ticketTiers: Array<{
    type: string;
    price: number;
    capacity: number;
  }>;
};

type CompanyOption = {
  id: string;
  name: string;
};

type SpeakerOption = {
  id: string;
  name: string;
};

const statusOptions = [
  "DRAFT",
  "PUBLISHED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];
const ticketTypeOptions = ["STANDARD", "VIP", "EARLY_BIRD", "FREE"];

function toDateInput(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function toDateTimeInput(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 16);
}

export function EditEventDrawer({
  event,
  companies,
  speakers,
}: {
  event: EventEditData;
  companies: CompanyOption[];
  speakers: SpeakerOption[];
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setForm((prev) => ({ ...prev, banner: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const [form, setForm] = useState({
    title: event.title,
    description: event.description ?? "",
    location: event.location,
    status: event.status,
    dateStart: toDateInput(event.dateStart),
    dateEnd: toDateInput(event.dateEnd),
    companyId: event.companyId,
    category: event.category ?? "",
    banner: event.banner ?? "",
    dateEndRegistration: toDateInput(event.dateEndRegistration ?? ""),
    typeTicket: event.typeTicket ?? "",
    price: event.price?.toString() ?? "",
  });

  const [sessions, setSessions] = useState(
    event.sessions.map((session) => ({
      ...session,
      start: toDateTimeInput(session.start),
      end: toDateTimeInput(session.end),
    })),
  );

  const [ticketTiers, setTicketTiers] = useState(
    event.ticketTiers.map((tier) => ({
      type: tier.type,
      price: String(tier.price),
      capacity: String(tier.capacity),
    })),
  );

  const selectedCompanyName = useMemo(
    () => companies.find((company) => company.id === form.companyId)?.name,
    [companies, form.companyId],
  );

  const handleSave = async () => {
    // Validate sessions before sending
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      if (!s.title.trim()) {
        setError(`Session ${i + 1}: title is required.`);
        return;
      }
      if (!s.speakerId) {
        setError(`Session ${i + 1}: please select a speaker.`);
        return;
      }
      if (!s.start) {
        setError(`Session ${i + 1}: start date/time is required.`);
        return;
      }
      if (!s.end) {
        setError(`Session ${i + 1}: end date/time is required.`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sessions,
          tickets: ticketTiers,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "Unable to update event.");
      }

      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update event.");
    } finally {
      setSaving(false);
    }
  };

  const updateSession = (index: number, field: string, value: string) => {
    setSessions((prev) =>
      prev.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, [field]: value } : session,
      ),
    );
  };

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      {
        id: "",
        title: "",
        description: "",
        speakerId: "",
        start: "",
        end: "",
      },
    ]);
  };

  const removeSession = (index: number) => {
    setSessions((prev) =>
      prev.filter((_, sessionIndex) => sessionIndex !== index),
    );
  };

  const updateTicketTier = (index: number, field: string, value: string) => {
    setTicketTiers((prev) =>
      prev.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [field]: value } : tier,
      ),
    );
  };

  const addTicketTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      { type: "STANDARD", price: "0", capacity: "0" },
    ]);
  };

  const removeTicketTier = (index: number) => {
    setTicketTiers((prev) =>
      prev.filter((_, tierIndex) => tierIndex !== index),
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={<Button variant="outline" className="rounded-xl" />}
      >
        Edit Event
      </DrawerTrigger>
      <DrawerContent side="right" className="sm:max-w-xl overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Edit event</DrawerTitle>
          <DrawerDescription>
            Update event information and save changes.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Event title</Label>
            <Input
              id="edit-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              className="min-h-28"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value || "" }))
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="e.g. Conference"
            />
          </div>

          <div className="grid gap-2">
            <Label>Banner</Label>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBannerUpload(file);
              }}
            />
            {form.banner ? (
              <div className="relative w-full overflow-hidden rounded-xl border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.banner}
                  alt="Event banner preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, banner: "" }))}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-destructive shadow-sm backdrop-blur hover:bg-background"
                  aria-label="Remove image"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-lg bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-background"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith("image/"))
                    handleBannerUpload(file);
                }}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, WEBP up to any size
                  </p>
                </div>
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-start-date">Start date</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={form.dateStart}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dateStart: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-end-date">End date</Label>
              <Input
                id="edit-end-date"
                type="date"
                value={form.dateEnd}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dateEnd: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-registration-end">Registration end</Label>
              <Input
                id="edit-registration-end"
                type="date"
                value={form.dateEndRegistration}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dateEndRegistration: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-company">Company</Label>
            <Select
              value={form.companyId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, companyId: value || "" }))
              }
            >
              <SelectTrigger id="edit-company">
                <SelectValue placeholder="Select company">
                  {selectedCompanyName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Sessions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSession}
              >
                Add session
              </Button>
            </div>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No sessions configured.
                </p>
              ) : (
                sessions.map((session, index) => (
                  <div
                    key={`${session.id || "new"}-${index}`}
                    className="rounded-xl border border-border/60 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Session {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSession(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input
                        value={session.title}
                        onChange={(e) =>
                          updateSession(index, "title", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Speaker</Label>
                      <Select
                        value={session.speakerId}
                        onValueChange={(value) =>
                          updateSession(index, "speakerId", value || "")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select speaker" />
                        </SelectTrigger>
                        <SelectContent>
                          {speakers.map((speaker) => (
                            <SelectItem key={speaker.id} value={speaker.id}>
                              {speaker.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>Start</Label>
                        <Input
                          type="datetime-local"
                          value={session.start}
                          onChange={(e) =>
                            updateSession(index, "start", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>End</Label>
                        <Input
                          type="datetime-local"
                          value={session.end}
                          onChange={(e) =>
                            updateSession(index, "end", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        className="min-h-20"
                        value={session.description}
                        onChange={(e) =>
                          updateSession(index, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Ticket tiers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTicketTier}
              >
                Add ticket tier
              </Button>
            </div>
            <div className="space-y-3">
              {ticketTiers.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No ticket tiers configured.
                </p>
              ) : (
                ticketTiers.map((tier, index) => (
                  <div
                    key={`${tier.type}-${index}`}
                    className="rounded-xl border border-border/60 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Tier {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicketTier(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select
                          value={tier.type}
                          onValueChange={(value) =>
                            updateTicketTier(index, "type", value || "")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ticket type" />
                          </SelectTrigger>
                          <SelectContent>
                            {ticketTypeOptions.map((ticketType) => (
                              <SelectItem key={ticketType} value={ticketType}>
                                {ticketType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={tier.price}
                          onChange={(e) =>
                            updateTicketTier(index, "price", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.capacity}
                        onChange={(e) =>
                          updateTicketTier(index, "capacity", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DrawerFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
