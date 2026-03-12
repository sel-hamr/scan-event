"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateRequestStatus(requestId: string, status: "ACCEPTED" | "REJECTED") {
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
