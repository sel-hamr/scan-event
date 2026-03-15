"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/icons/logo";
import {
  getAppearancePrefsFromCookie,
  setDarkModeCookie,
} from "@/lib/appearance-cookie";

export function PublicNavbar() {
  const [isDark, setIsDark] = useState(
    () => getAppearancePrefsFromCookie().darkMode,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleThemeToggle = () => {
    const nextDarkMode = !isDark;
    setIsDark(nextDarkMode);
    document.documentElement.classList.toggle("dark", nextDarkMode);
    setDarkModeCookie(nextDarkMode);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/login" className="group flex items-center gap-2.5">
          <span className="rounded-lg border border-border bg-secondary/70 p-1 transition-colors group-hover:bg-secondary">
            <LogoIcon className="h-5 w-5 rounded" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">orcheo</p>
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
        </div>
      </div>
    </header>
  );
}
