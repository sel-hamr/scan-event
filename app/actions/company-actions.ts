"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCompany(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const logo = formData.get("logo") as string;

  if (!name || !description || !email) {
    throw new Error("Missing required fields");
  }

  await prisma.company.create({
    data: {
      name,
      description,
      email,
      website: website || null,
      phone: phone || null,
      address: address || null,
      logo: logo || null,
    },
  });

  revalidatePath("/companies");
  redirect("/companies");
}
