import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, BellIcon, InfoIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";
import { NotificationActions, MarkAllReadButton } from "@/components/notification-actions";
import { auth } from "@/auth";

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'info': return <InfoIcon className="h-5 w-5 text-blue-500" />;
    case 'success': return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
    case 'warning': return <AlertTriangleIcon className="h-5 w-5 text-amber-500" />;
    case 'error': return <XCircleIcon className="h-5 w-5 text-destructive" />;
    default: return <BellIcon className="h-5 w-5 text-muted-foreground" />;
  }
};

const getTypeBg = (type: string) => {
  switch (type.toLowerCase()) {
    case 'info': return 'bg-blue-500/10 border-blue-500/20';
    case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'warning': return 'bg-amber-500/10 border-amber-500/20';
    case 'error': return 'bg-destructive/10 border-destructive/20';
    default: return 'bg-muted border-border';
  }
};

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold">Please log in to see your notifications</h2>
      </div>
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on platform activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search alerts..." className="w-full bg-background pl-9 rounded-xl" />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
            <FilterIcon className="h-4 w-4" />
          </Button>
          <MarkAllReadButton userId={userId} />
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur overflow-hidden">
        <CardContent className="p-0 divide-y divide-border/50">
          {notifications.map((notif) => (
            <div key={notif.id} className={cn(
              "p-4 sm:p-6 flex items-start gap-4 transition-colors hover:bg-muted/30",
              !notif.read && "bg-muted/10 relative"
            )}>
              {/* Unread dot indicator */}
              {!notif.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
              
              <div className={cn(
                "mt-0.5 h-10 w-10 shrink-0 rounded-full flex items-center justify-center border",
                getTypeBg(notif.type)
              )}>
                {getTypeIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
                  <h3 className={cn("text-base", !notif.read ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {formatDateTime(notif.createdAt)}
                  </span>
                </div>
                
                <p className={cn("text-sm", !notif.read ? "text-muted-foreground" : "text-muted-foreground/80")}>
                  {notif.body}
                </p>
                
                <div className="pt-2">
                  <NotificationActions notificationId={notif.id} isRead={notif.read} />
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <BellIcon className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-medium">All caught up!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                You don't have any new notifications right now. We'll let you know when something important happens.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
