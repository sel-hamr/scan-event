"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAsRead,
  deleteNotification,
  toggleReadStatus,
  markAllAsRead,
} from "@/app/actions/notification-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/stores";

interface NotificationActionsProps {
  notificationId: string;
  isRead: boolean;
}

export function NotificationActions({
  notificationId,
  isRead,
}: NotificationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUnreadCount } = useNotificationStore();

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    try {
      const result = await markAsRead(notificationId);
      setUnreadCount(result.unreadCount);
      router.refresh();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRead = async () => {
    setIsLoading(true);
    try {
      const result = await toggleReadStatus(notificationId, isRead);
      setUnreadCount(result.unreadCount);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle notification status", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    setIsLoading(true);
    try {
      const result = await deleteNotification(notificationId);
      setUnreadCount(result.unreadCount);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete notification", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRead && (
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
          onClick={handleMarkAsRead}
          disabled={isLoading}
        >
          Mark as read
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground shrink-0"
            disabled={isLoading}
          >
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          <DropdownMenuItem onClick={handleToggleRead}>
            {isRead ? "Mark as unread" : "Mark as read"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            Delete notification
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function MarkAllReadButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUnreadCount } = useNotificationStore();

  const handleMarkAllRecent = async () => {
    setIsLoading(true);
    try {
      const result = await markAllAsRead(userId);
      setUnreadCount(result.unreadCount);
      router.refresh();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="shrink-0 rounded-xl"
      onClick={handleMarkAllRecent}
      disabled={isLoading}
    >
      Mark all as read
    </Button>
  );
}
