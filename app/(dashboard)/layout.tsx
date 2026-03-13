"use client";

import { useEffect } from "react";
import { useSidebarStore } from "@/stores";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { cn } from "@/lib/utils";

const DEFAULT_APPEARANCE_PREFS = {
  darkMode: true,
  autoCollapseSidebar: true,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setCollapsed } = useSidebarStore();

  useEffect(() => {
    const readAppearancePrefs = () => {
      if (typeof window === "undefined") return DEFAULT_APPEARANCE_PREFS;

      const raw = window.localStorage.getItem("settings:appearance");
      if (!raw) return DEFAULT_APPEARANCE_PREFS;

      try {
        const parsed = JSON.parse(raw);
        return {
          darkMode:
            typeof parsed.darkMode === "boolean"
              ? parsed.darkMode
              : DEFAULT_APPEARANCE_PREFS.darkMode,
          autoCollapseSidebar:
            typeof parsed.autoCollapseSidebar === "boolean"
              ? parsed.autoCollapseSidebar
              : DEFAULT_APPEARANCE_PREFS.autoCollapseSidebar,
        };
      } catch {
        return DEFAULT_APPEARANCE_PREFS;
      }
    };

    const applyAppearance = () => {
      const prefs = readAppearancePrefs();
      document.documentElement.classList.toggle("dark", prefs.darkMode);

      if (prefs.autoCollapseSidebar) {
        setCollapsed(window.innerWidth < 768);
      }
    };

    applyAppearance();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "settings:appearance") {
        applyAppearance();
      }
    };

    const handleResize = () => {
      const prefs = readAppearancePrefs();
      if (prefs.autoCollapseSidebar) {
        setCollapsed(window.innerWidth < 768);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorage);
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
