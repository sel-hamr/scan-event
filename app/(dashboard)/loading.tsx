import { LogoIcon } from "@/components/icons/logo";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] w-full items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-border/50 bg-card/50 p-8 shadow-sm backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <LogoIcon className="h-14 w-14 animate-pulse" aria-hidden="true" />
            <span className="absolute -inset-2 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight">Loading</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please wait while content is being prepared...
          </p>

          <div className="mt-6 w-full space-y-3">
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-2.5 w-5/6 rounded-full" />
            <Skeleton className="h-2.5 w-2/3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
