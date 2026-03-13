"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebarStore, useNotificationStore } from "@/stores";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

type HeaderUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  events: "Events",
  tickets: "Tickets",
  scanner: "QR Scanner",
  speakers: "Speakers",
  exposants: "Exposants",
  sponsors: "Sponsors",
  networking: "Networking",
  notifications: "Notifications",
  settings: "Settings",
  new: "Create New",
};

export function AppHeader() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  const { unreadCount } = useNotificationStore();
  const [isDark, setIsDark] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<HeaderUser | null>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (!response.ok) {
          if (active) setCurrentUser(null);
          return;
        }
        const data = await response.json();
        if (active) {
          setCurrentUser(data.user ?? null);
        }
      } catch {
        if (active) setCurrentUser(null);
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    ...segments.map((seg, i) => ({
      label: routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  const handleThemeToggle = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const displayName = currentUser?.name ?? "User";
  const displayEmail = currentUser?.email ?? "";
  const displayRole = (currentUser?.role ?? "participant").replace("_", " ");

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-md transition-all duration-300",
        isCollapsed ? "ml-17" : "ml-65",
      )}
    >
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {i === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="font-medium">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink>
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4.5 w-4.5" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-muted-foreground hover:text-foreground"
          onClick={handleThemeToggle}
        >
          {isDark ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </Button>

        {/* Notifications */}
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="ml-1 flex items-center gap-2 rounded-xl px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize">
                  {displayRole}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/settings">Profile & Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
