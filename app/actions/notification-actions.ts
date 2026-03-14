"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAsRead(notificationId: string) {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
    select: { userId: true },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: notification.userId, read: false },
  });

  revalidatePath("/notifications");

  return { unreadCount };
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  revalidatePath("/notifications");

  return { unreadCount };
}

export async function deleteNotification(notificationId: string) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!existing) {
    revalidatePath("/notifications");
    return { unreadCount: 0 };
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: existing.userId, read: false },
  });

  revalidatePath("/notifications");

  return { unreadCount };
}

export async function toggleReadStatus(
  notificationId: string,
  currentStatus: boolean,
) {
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: !currentStatus },
    select: { userId: true },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: notification.userId, read: false },
  });

  revalidatePath("/notifications");

  return { unreadCount };
}
