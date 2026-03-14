"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

export async function sendFriendRequest(formData: FormData) {
  const auth = await getAuthFromCookieStore();
  const senderId = auth?.userId;
  const receiverId = (formData.get("receiverId") as string | null)?.trim();
  const messageInput = (formData.get("message") as string | null)?.trim();
  const message = messageInput || "I'd like to connect with you.";

  if (!senderId) {
    throw new Error("Unauthorized");
  }

  if (!receiverId || receiverId === senderId) {
    throw new Error("Invalid receiver");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });

  if (!receiver) {
    throw new Error("User not found");
  }

  const existingRequest = await prisma.networkingRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      status: {
        in: ["PENDING", "ACCEPTED"],
      },
    },
    select: { id: true },
  });

  if (existingRequest) {
    revalidatePath("/networking/users");
    return;
  }

  const latestEvent = await prisma.event.findFirst({
    orderBy: { dateStart: "desc" },
    select: { id: true },
  });

  if (!latestEvent) {
    throw new Error("No events available for networking request");
  }

  await prisma.networkingRequest.create({
    data: {
      senderId,
      receiverId,
      eventId: latestEvent.id,
      message,
      status: "PENDING",
    },
  });

  revalidatePath("/networking");
  revalidatePath("/networking/users");
}

export async function updateRequestStatus(
  requestId: string,
  status: "ACCEPTED" | "REJECTED",
) {
  await prisma.networkingRequest.update({
    where: { id: requestId },
    data: { status },
  });

  revalidatePath("/networking");
}

export async function deleteRequest(requestId: string) {
  await prisma.networkingRequest.delete({
    where: { id: requestId },
  });

  revalidatePath("/networking");
}
