"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebarStore, useNotificationStore } from "@/stores";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  getAppearancePrefsFromCookie,
  setDarkModeCookie,
} from "@/lib/appearance-cookie";

type HeaderUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
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
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [isDark, setIsDark] = React.useState(
    () => getAppearancePrefsFromCookie().darkMode,
  );
  const [currentUser, setCurrentUser] = React.useState<HeaderUser | null>(null);
  const [userLoaded, setUserLoaded] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const [userResponse, unreadResponse] = await Promise.all([
          fetch("/api/me", { cache: "no-store" }),
          fetch("/api/notifications/unread-count", { cache: "no-store" }),
        ]);

        if (!userResponse.ok) {
          if (active) {
            setCurrentUser(null);
            setUnreadCount(0);
            setUserLoaded(true);
          }
          return;
        }

        const data = await userResponse.json();
        let nextUnreadCount = 0;

        if (unreadResponse.ok) {
          const unreadData = await unreadResponse.json();
          nextUnreadCount = Number(unreadData?.unreadCount ?? 0);
        }

        if (active) {
          setCurrentUser(data.user ?? null);
          setUnreadCount(Number.isNaN(nextUnreadCount) ? 0 : nextUnreadCount);
          setUserLoaded(true);
        }
      } catch {
        if (active) {
          setCurrentUser(null);
          setUnreadCount(0);
          setUserLoaded(true);
        }
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, [pathname, setUnreadCount]);

  const segments = (pathname ?? "/").split("/").filter(Boolean);

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    ...segments.map((seg, i) => ({
      label: routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  const handleThemeToggle = () => {
    const nextDarkMode = !isDark;
    document.documentElement.classList.toggle("dark", nextDarkMode);
    setIsDark(nextDarkMode);
    setDarkModeCookie(nextDarkMode);
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

  const handleViewAccount = () => {
    router.push("/settings");
  };

  const displayName = currentUser?.name ?? "";
  const displayEmail = currentUser?.email ?? "";
  const displayRole = currentUser?.role
    ? currentUser.role.replace("_", " ")
    : "";
  const displayAvatar = currentUser?.avatar ?? undefined;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

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
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {userLoaded ? (
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium text-foreground">
                    {displayName || "User"}
                  </span>
                  {displayRole ? (
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {displayRole}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <div className="px-1.5 py-1">
              <div className="flex flex-col space-y-1">
                {userLoaded ? (
                  <>
                    <p className="text-sm font-medium">
                      {displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {displayEmail}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewAccount}>
              View my account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
