"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Shield, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;

    const raw = window.localStorage.getItem("settings:appearance");
    if (!raw) return true;

    try {
      const parsed = JSON.parse(raw) as { darkMode?: boolean };
      return typeof parsed.darkMode === "boolean" ? parsed.darkMode : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleThemeToggle = () => {
    const nextDarkMode = !isDark;
    setIsDark(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);

    const raw = window.localStorage.getItem("settings:appearance");
    let parsed: Record<string, unknown> = {};

    if (raw) {
      try {
        parsed = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        parsed = {};
      }
    }

    window.localStorage.setItem(
      "settings:appearance",
      JSON.stringify({ ...parsed, darkMode: nextDarkMode }),
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/login" className="group flex items-center gap-2.5">
          <span className="rounded-lg border border-border bg-secondary/70 p-1.5 transition-colors group-hover:bg-secondary">
            <Shield className="h-4 w-4 text-foreground" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">EventScan</p>
            <p className="text-xs text-muted-foreground">Disconnected mode</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={handleThemeToggle}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "shadow-sm")}
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}
