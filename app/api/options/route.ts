import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  let currentUser: { role: string; companyId: string | null } | null = userRole
    ? { role: userRole, companyId: null }
    : null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    if (user) {
      currentUser = user;
    }
  }

  const [companies, speakers, sponsors, exposants] = await Promise.all([
    prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.speaker.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.sponsor.findMany({
      select: { id: true, name: true, company: true, tier: true },
      orderBy: { name: "asc" },
    }),
    prisma.exposant.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        standNumber: true,
      },
      orderBy: { company: "asc" },
    }),
  ]);

  return NextResponse.json({
    companies,
    speakers,
    sponsors,
    exposants,
    currentUser,
  });
}
