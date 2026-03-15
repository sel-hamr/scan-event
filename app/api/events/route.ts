import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventStatus, NotificationType } from "@prisma/client";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        dateStart: "desc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      title,
      dateStart,
      dateEnd,
      status,
      location,
      companyId,
      description,
      banner,
      sessions,
      tickets,
      sponsorIds,
      exposantIds,
    } = data;

    const auth = await getAuthFromCookieStore();
    const currentUserId = auth?.userId;

    const user = currentUserId
      ? await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { id: true, role: true, companyId: true },
        })
      : await prisma.user.findFirst({
          select: { id: true, role: true, companyId: true },
        });

    if (!user) {
      return NextResponse.json(
        { error: "No user found in database to act as organiser" },
        { status: 400 },
      );
    }

    const requestedCompanyId =
      typeof companyId === "string" ? companyId.trim() : "";

    const normalizedCompanyId =
      user.role === "ORGANISATEUR"
        ? (user.companyId?.trim() ?? "")
        : requestedCompanyId;

    if (!normalizedCompanyId) {
      return NextResponse.json(
        {
          error:
            user.role === "ORGANISATEUR"
              ? "Your organizer account must be linked to a company before creating events."
              : "Please select a valid company before creating the event.",
        },
        { status: 400 },
      );
    }

    const companyExists = await prisma.company.findUnique({
      where: { id: normalizedCompanyId },
      select: { id: true },
    });

    if (!companyExists) {
      return NextResponse.json(
        { error: "Selected company was not found." },
        { status: 400 },
      );
    }

    const normalizedStatus =
      typeof status === "string" &&
      status.trim().toUpperCase() === EventStatus.PUBLISHED
        ? EventStatus.PUBLISHED
        : EventStatus.DRAFT;

    const normalizedSponsorIds = Array.isArray(sponsorIds)
      ? Array.from(
          new Set(
            sponsorIds.filter((id): id is string => typeof id === "string"),
          ),
        )
      : [];

    const normalizedExposantIds = Array.isArray(exposantIds)
      ? Array.from(
          new Set(
            exposantIds.filter((id): id is string => typeof id === "string"),
          ),
        )
      : [];

    const totalCapacity = tickets
      ? tickets.reduce(
          (acc: number, t: any) => acc + (parseInt(t.capacity) || 0),
          0,
        )
      : 0;

    const event = await prisma.event.create({
      data: {
        title,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        location: location || "TBD",
        status: normalizedStatus,
        description: description || "",
        companyId: normalizedCompanyId,
        organiserId: user.id,
        attendeesCount: totalCapacity,
        ...(typeof banner === "string" && banner.startsWith("data:image/")
          ? { banner }
          : {}),
        rooms: {
          create: [
            {
              name: "Main Hall",
              capacity: Math.max(500, totalCapacity),
            },
          ],
        },
      },
      include: {
        rooms: true,
      },
    });

    const defaultRoomId = event.rooms[0].id;

    if (sessions && sessions.length > 0) {
      await prisma.session.createMany({
        data: sessions.map((s: any) => ({
          title: s.title,
          description: s.description || "",
          start: new Date(`${dateStart}T${s.start}:00`),
          end: new Date(`${dateStart}T${s.end}:00`),
          roomId: defaultRoomId,
          eventId: event.id,
          speakerId: s.speaker,
        })),
      });
    }

    if (tickets && tickets.length > 0) {
      const ticketRecords: any[] = [];
      for (const t of tickets) {
        const capacity = parseInt(t.capacity) || 0;
        const typeMap: Record<string, string> = {
          standard: "STANDARD",
          vip: "VIP",
          early_bird: "EARLY_BIRD",
          free: "FREE",
        };
        const ticketType = typeMap[t.type] || "STANDARD";
        const price = parseFloat(t.price) || 0;

        for (let i = 0; i < capacity; i++) {
          ticketRecords.push({
            eventId: event.id,
            type: ticketType as any,
            price: price,
            status: "ACTIVE",
          });
        }
      }

      if (ticketRecords.length > 0) {
        await prisma.ticket.createMany({
          data: ticketRecords,
        });
      }
    }

    if (normalizedSponsorIds.length > 0) {
      const selectedSponsors = await prisma.sponsor.findMany({
        where: { id: { in: normalizedSponsorIds } },
        select: { name: true, company: true, tier: true, logo: true },
      });

      if (selectedSponsors.length > 0) {
        await prisma.sponsor.createMany({
          data: selectedSponsors.map((sponsor) => ({
            name: sponsor.name,
            company: sponsor.company,
            tier: sponsor.tier,
            logo: sponsor.logo,
            eventId: event.id,
          })),
        });
      }
    }

    if (normalizedExposantIds.length > 0) {
      const selectedExposants = await prisma.exposant.findMany({
        where: { id: { in: normalizedExposantIds } },
        select: {
          name: true,
          email: true,
          company: true,
          standNumber: true,
        },
      });

      if (selectedExposants.length > 0) {
        await prisma.exposant.createMany({
          data: selectedExposants.map((exposant) => ({
            name: exposant.name,
            email: exposant.email,
            company: exposant.company,
            standNumber: exposant.standNumber,
            eventId: event.id,
          })),
        });
      }
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Event created",
        body: `Your event \"${event.title}\" was created successfully.`,
        type: NotificationType.SUCCESS,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create event",
      },
      { status: 500 },
    );
  }
}
