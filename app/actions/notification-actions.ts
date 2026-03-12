"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

export async function deleteNotification(notificationId: string) {
  await prisma.notification.delete({
    where: { id: notificationId },
  });

  revalidatePath("/notifications");
}

export async function toggleReadStatus(notificationId: string, currentStatus: boolean) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: !currentStatus },
  });

  revalidatePath("/notifications");
}
