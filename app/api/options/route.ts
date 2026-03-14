import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

export async function GET() {
  const auth = await getAuthFromCookieStore();
  const userId = auth?.userId;
  const userRole = auth?.role;

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

  const [companies, speakers, rawSponsors, rawExposants] = await Promise.all([
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

  const sponsors = Array.from(
    new Map(
      rawSponsors.map((sponsor) => [
        `${sponsor.name}::${sponsor.company}::${sponsor.tier}`,
        sponsor,
      ]),
    ).values(),
  );

  const exposants = Array.from(
    new Map(
      rawExposants.map((exposant) => [
        `${exposant.name}::${exposant.company}::${exposant.standNumber}`,
        exposant,
      ]),
    ).values(),
  );

  return NextResponse.json({
    companies,
    speakers,
    sponsors,
    exposants,
    currentUser,
  });
}
