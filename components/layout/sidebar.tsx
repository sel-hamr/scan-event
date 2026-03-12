"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ScanLine,
  Mic2,
  Store,
  Handshake,
  Users,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "QR Scanner", href: "/scanner", icon: ScanLine },
  { label: "Speakers", href: "/speakers", icon: Mic2 },
  { label: "Exposants", href: "/exposants", icon: Store },
  { label: "Sponsors", href: "/sponsors", icon: Handshake },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Networking", href: "/networking", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    const loadRole = async () => {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (!response.ok) {
          if (active) setUserRole(null);
          return;
        }

        const data = await response.json();
        if (active) {
          setUserRole(data?.user?.role ?? null);
        }
      } catch {
        if (active) setUserRole(null);
      }
    };

    loadRole();

    return () => {
      active = false;
    };
  }, []);

  const visibleNavItems =
    userRole === "PARTICIPANT"
      ? navItems.filter((item) =>
          ["Events", "Networking", "Notifications"].includes(item.label),
        )
      : navItems;

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-sidebar transition-all duration-300",
          isCollapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold tracking-tight text-foreground">
                EventScan
              </span>
              <span className="text-[11px] text-muted-foreground">
                Management
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border/50 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className={cn(
              "w-full rounded-xl text-muted-foreground hover:text-foreground",
              isCollapsed && "px-2",
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
