"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSpeaker(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const bio = formData.get("bio") as string;
  const topic = formData.get("topic") as string;
  const company = formData.get("company") as string;
  const avatar = formData.get("avatar") as string;

  if (!name || !email || !bio || !topic) {
    throw new Error("Missing required fields");
  }

  await prisma.speaker.create({
    data: {
      name,
      email,
      bio,
      topic,
      company: company || null,
      avatar: avatar || null,
    },
  });

  revalidatePath("/speakers");
  redirect("/speakers");
}
