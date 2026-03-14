"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/stores";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import {
  APPEARANCE_CHANGE_EVENT,
  getAppearancePrefsFromCookie,
} from "@/lib/appearance-cookie";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setCollapsed } = useSidebarStore();

  useEffect(() => {
    const applyAppearance = () => {
      const prefs = getAppearancePrefsFromCookie();
      document.documentElement.classList.toggle("dark", prefs.darkMode);

      if (prefs.autoCollapseSidebar) {
        setCollapsed(window.innerWidth < 768);
      }
    };

    applyAppearance();

    const handleResize = () => {
      const prefs = getAppearancePrefsFromCookie();
      if (prefs.autoCollapseSidebar) {
        setCollapsed(window.innerWidth < 768);
      }
    };

    window.addEventListener(APPEARANCE_CHANGE_EVENT, applyAppearance);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(APPEARANCE_CHANGE_EVENT, applyAppearance);
      window.removeEventListener("resize", handleResize);
    };
  }, [setCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <AppHeader />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] p-6 transition-all duration-300",
          isCollapsed ? "ml-17" : "ml-65",
        )}
      >
        {children}
      </main>
    </div>
  );
}
