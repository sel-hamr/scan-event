"use client";

import { useState, useTransition } from "react";
import {
  Pencil,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  Shield,
  ImageIcon,
  Building2,
  Search,
  CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { updateUser } from "@/app/actions/user-actions";

const ROLES = [
  { value: "PARTICIPANT", label: "Participant", emoji: "🎟️" },
  { value: "ORGANISATEUR", label: "Organizer", emoji: "🎯" },
  { value: "SCANNER", label: "Scanner", emoji: "📡" },
  { value: "EXPOSANT", label: "Exhibitor", emoji: "🏢" },
  { value: "SPEAKER", label: "Speaker", emoji: "🎤" },
  { value: "SUPER_ADMIN", label: "Super Admin", emoji: "👑" },
];

type Company = { id: string; name: string };

type EditUserDrawerProps = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    companyId: string | null;
  };
  companies: Company[];
};

export function EditUserDrawer({ user, companies }: EditUserDrawerProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(user.avatar ?? "");
  const [nameVal, setNameVal] = useState(user.name);
  const [roleVal, setRoleVal] = useState(user.role);
  const [companyIdVal, setCompanyIdVal] = useState(user.companyId ?? "");
  const [companySearch, setCompanySearch] = useState("");

  const isOrganizer = roleVal === "ORGANISATEUR";

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase().trim()),
  );

  const selectedCompany = companies.find((c) => c.id === companyIdVal);

  function handleOpen(val: boolean) {
    setOpen(val);
    if (val) {
      setNameVal(user.name);
      setRoleVal(user.role);
      setAvatarUrl(user.avatar ?? "");
      setCompanyIdVal(user.companyId ?? "");
      setCompanySearch("");
      setStatus(null);
    }
  }

  function handleRoleChange(val: string | null) {
    if (!val) return;
    setRoleVal(val);
    if (val !== "ORGANISATEUR") {
      setCompanyIdVal("");
      setCompanySearch("");
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set("role", roleVal);
    formData.set("avatar", avatarUrl);
    formData.set("companyId", isOrganizer ? companyIdVal : "");

    setStatus(null);
    startTransition(async () => {
      const result = await updateUser(formData);
      if (result?.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "User updated successfully!" });
        setTimeout(() => {
          setOpen(false);
          setStatus(null);
        }, 1200);
      }
    });
  }

  const initials = nameVal
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Button
        id="edit-user-btn"
        onClick={() => handleOpen(true)}
        size="sm"
        className="gap-2 rounded-xl"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit User
      </Button>

      <Sheet open={open} onOpenChange={handleOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-lg flex flex-col gap-0 p-0"
        >
          {/* ── Header ── */}
          <SheetHeader className="border-b border-border/50 px-6 py-5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-bold">Edit User</SheetTitle>
                <SheetDescription className="mt-1">
                  Updating{" "}
                  <span className="font-semibold text-foreground">
                    {user.name}
                  </span>
                </SheetDescription>
              </div>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="rounded-full h-8 w-8 shrink-0"
                  />
                }
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto">
            <form id="edit-user-form" action={handleSubmit}>
              <input type="hidden" name="userId" value={user.id} />

              <div className="px-6 pt-6 pb-4 space-y-6">
                {/* Avatar preview + URL */}
                <div className="flex flex-col items-center gap-4 p-5 rounded-2xl bg-muted/20 border border-border/40">
                  <Avatar className="h-20 w-20 border-2 border-border/30 shadow-lg">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                      {initials || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full space-y-1.5">
                    <Label
                      htmlFor="edit-avatar"
                      className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Avatar URL
                    </Label>
                    <Input
                      id="edit-avatar"
                      name="avatar"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="rounded-xl bg-background h-10"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-name"
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5"
                  >
                    <User className="h-3 w-3" />
                    Full Name <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    type="text"
                    required
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    placeholder="Jane Doe"
                    className="rounded-xl bg-background h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-email"
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5"
                  >
                    <Mail className="h-3 w-3" />
                    Email Address{" "}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    required
                    defaultValue={user.email}
                    placeholder="jane@example.com"
                    className="rounded-xl bg-background h-11"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-phone"
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5"
                  >
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    defaultValue={user.phone ?? ""}
                    placeholder="+1 555 000 0000"
                    className="rounded-xl bg-background h-11"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-role-trigger"
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5"
                  >
                    <Shield className="h-3 w-3" />
                    Role <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Select value={roleVal} onValueChange={handleRoleChange}>
                    <SelectTrigger
                      id="edit-role-trigger"
                      className="w-full rounded-xl bg-background h-11"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.emoji} {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ── Company section — always visible below role ── */}
              <div className="border-t border-border/50">
                {/* Section label */}
                <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                      Linked Company
                    </span>
                    {isOrganizer && (
                      <span className="text-[10px] text-destructive font-bold ml-0.5">
                        required for Organizer
                      </span>
                    )}
                  </div>
                  {companyIdVal && (
                    <button
                      type="button"
                      onClick={() => setCompanyIdVal("")}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Selected company pill */}
                {selectedCompany && (
                  <div className="mx-6 mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary truncate flex-1">
                      {selectedCompany.name}
                    </span>
                    <CheckIcon className="h-4 w-4 text-primary shrink-0" />
                  </div>
                )}

                {/* Search input */}
                {companies.length > 5 && (
                  <div className="px-6 pb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        type="search"
                        placeholder="Search companies…"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="pl-9 h-9 rounded-xl bg-background text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Company list */}
                <div className="px-6 pb-6">
                  {companies.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-center rounded-2xl bg-muted/10 border border-dashed border-border/50">
                      <Building2 className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No companies found.
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        Create a company first to link it here.
                      </p>
                    </div>
                  ) : filteredCompanies.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No companies match &ldquo;{companySearch}&rdquo;
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5 rounded-xl">
                      {filteredCompanies.map((company) => {
                        const isSelected = companyIdVal === company.id;
                        return (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() =>
                              setCompanyIdVal(
                                isSelected ? "" : company.id,
                              )
                            }
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150",
                              isSelected
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-muted/10 border-border/30 hover:bg-muted/30 hover:border-border/60 text-foreground",
                            )}
                          >
                            {/* Company icon */}
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "bg-primary/15"
                                  : "bg-muted/40",
                              )}
                            >
                              <Building2
                                className={cn(
                                  "h-4 w-4 transition-colors",
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>

                            {/* Name */}
                            <span className="flex-1 text-sm font-medium truncate">
                              {company.name}
                            </span>

                            {/* Check indicator */}
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-border/50",
                              )}
                            >
                              {isSelected && (
                                <CheckIcon className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {isOrganizer && !companyIdVal && companies.length > 0 && (
                    <p className="mt-3 text-[10px] text-amber-500/80 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      Select a company to save the Organizer role.
                    </p>
                  )}
                </div>
              </div>
            </form>

            {/* Status banner */}
            {status && (
              <div className="px-6 pb-6">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300",
                    status.type === "error"
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                  )}
                >
                  {status.type === "error" ? (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  {status.message}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <SheetFooter className="border-t border-border/50 px-6 py-5 flex flex-row gap-3 shrink-0">
            <SheetClose
              render={
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1 rounded-xl h-11"
                  disabled={isPending}
                />
              }
            >
              Cancel
            </SheetClose>

            <Button
              type="submit"
              form="edit-user-form"
              className="flex-1 rounded-xl h-11 gap-2"
              disabled={
                isPending ||
                (isOrganizer && !companyIdVal && companies.length > 0)
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
