"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.PARTICIPANT,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to register user. Please try again." };
  }
}

export async function updateUser(formData: FormData) {
  const auth = await getAuthFromCookieStore();
  const callerRole = auth?.role;

  if (callerRole !== "SUPER_ADMIN") {
    return { error: "Unauthorized. Only Super Admins can edit users." };
  }

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const avatar = (formData.get("avatar") as string) || null;
  const role = formData.get("role") as string;
  const companyId = (formData.get("companyId") as string) || null;

  if (!userId || !name || !email || !role) {
    return { error: "Name, email, and role are required." };
  }

  const validRoles = Object.values(UserRole) as string[];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role selected." };
  }

  // When assigning to Organizer, company is required
  if (role === "ORGANISATEUR" && !companyId) {
    return { error: "An Organizer must be linked to a company." };
  }

  // Validate company exists when provided
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      return { error: "Selected company does not exist." };
    }
  }

  try {
    const emailConflict = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });

    if (emailConflict) {
      return { error: "Another account already uses this email." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        avatar: avatar?.trim() || null,
        role: role as UserRole,
        // Link company for Organizers, clear for everyone else
        companyId: role === "ORGANISATEUR" ? companyId : null,
      },
    });

    revalidatePath(`/networking/users/${userId}`);
    revalidatePath("/networking/users");
    return { success: true };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "Failed to update user. Please try again." };
  }
}
