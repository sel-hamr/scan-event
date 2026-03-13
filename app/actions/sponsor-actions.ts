"use server";

import { SponsorTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const validTiers = new Set<SponsorTier>([
  SponsorTier.PLATINUM,
  SponsorTier.GOLD,
  SponsorTier.SILVER,
  SponsorTier.BRONZE,
]);

export async function createSponsor(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const logo = (formData.get("logo") as string)?.trim();

  const rawTier = ((formData.get("tier") as string) || "").toUpperCase();
  const tier = rawTier as SponsorTier;

  if (!name || !company || !validTiers.has(tier)) {
    throw new Error("Missing required fields");
  }

  const fallbackEvent = await prisma.event.findFirst({
    select: { id: true },
    orderBy: { dateStart: "desc" },
  });

  if (!fallbackEvent) {
    throw new Error("At least one event is required before creating sponsors");
  }

  await prisma.sponsor.create({
    data: {
      name,
      company,
      eventId: fallbackEvent.id,
      tier,
      logo: logo || null,
    },
  });

  revalidatePath("/sponsors");
  redirect("/sponsors");
}

export async function updateSponsor(formData: FormData) {
  const sponsorId = (formData.get("sponsorId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const logo = (formData.get("logo") as string)?.trim();

  const rawTier = ((formData.get("tier") as string) || "").toUpperCase();
  const tier = rawTier as SponsorTier;

  if (!sponsorId || !name || !company || !validTiers.has(tier)) {
    throw new Error("Missing required fields");
  }

  await prisma.sponsor.update({
    where: { id: sponsorId },
    data: {
      name,
      company,
      tier,
      logo: logo || null,
    },
  });

  revalidatePath("/sponsors");
  revalidatePath(`/sponsors/${sponsorId}`);
  revalidatePath(`/sponsors/${sponsorId}/edit`);
  redirect("/sponsors");
}

export async function deleteSponsor(sponsorId: string) {
  if (!sponsorId) {
    throw new Error("Sponsor id is required");
  }

  await prisma.sponsor.delete({
    where: { id: sponsorId },
  });

  revalidatePath("/sponsors");
}
