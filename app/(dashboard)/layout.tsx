"use client";

import { useSidebarStore } from "@/stores";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <AppHeader />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] p-6 transition-all duration-300",
          isCollapsed ? "ml-[68px]" : "ml-[260px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
