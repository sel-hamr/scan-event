"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExposant(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const selectedEventId = (formData.get("eventId") as string)?.trim();

  if (!name || !email || !company) {
    throw new Error("Missing required fields");
  }

  let eventId: string | undefined = selectedEventId;

  if (eventId) {
    const selectedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!selectedEvent) {
      eventId = undefined;
    }
  }

  if (!eventId) {
    const fallbackEvent = await prisma.event.findFirst({
      select: { id: true },
      orderBy: { dateStart: "desc" },
    });

    if (!fallbackEvent) {
      throw new Error(
        "At least one event is required before creating exposants",
      );
    }

    eventId = fallbackEvent.id;
  }

  await prisma.exposant.create({
    data: {
      name,
      email,
      company,
      standNumber: "TBD",
      eventId,
    },
  });

  revalidatePath("/exposants");
  redirect("/exposants");
}
