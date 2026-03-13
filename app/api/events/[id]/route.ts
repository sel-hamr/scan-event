import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { EventStatus, TicketType } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  if (!userId || !userRole) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, organiserId: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const canEdit =
    userRole === "SUPER_ADMIN" ||
    userRole === "ORGANISATEUR" ||
    (userRole === "PARTICIPANT" && event.organiserId === userId);

  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const location =
    typeof body?.location === "string" ? body.location.trim() : "";
  const dateStart =
    typeof body?.dateStart === "string" ? body.dateStart.trim() : "";
  const dateEnd = typeof body?.dateEnd === "string" ? body.dateEnd.trim() : "";
  const companyId =
    typeof body?.companyId === "string" ? body.companyId.trim() : "";
  const rawStatus =
    typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";
  const category =
    typeof body?.category === "string" ? body.category.trim() : "";
  const banner = typeof body?.banner === "string" ? body.banner.trim() : "";
  const dateEndRegistration =
    typeof body?.dateEndRegistration === "string"
      ? body.dateEndRegistration.trim()
      : "";
  const typeTicket =
    typeof body?.typeTicket === "string" ? body.typeTicket.trim() : "";
  const rawPrice =
    typeof body?.price === "string" || typeof body?.price === "number"
      ? String(body.price).trim()
      : "";
  const sessionsInput = Array.isArray(body?.sessions) ? body.sessions : null;
  const ticketsInput = Array.isArray(body?.tickets) ? body.tickets : null;

  if (!title || !location || !dateStart || !dateEnd || !companyId) {
    return NextResponse.json(
      { error: "Title, dates, location, and company are required." },
      { status: 400 },
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 400 });
  }

  const validStatuses = new Set(Object.values(EventStatus));
  const status = validStatuses.has(rawStatus as EventStatus)
    ? (rawStatus as EventStatus)
    : EventStatus.DRAFT;

  const normalizedTypeTicket = typeTicket ? typeTicket.toUpperCase() : null;

  const price = rawPrice === "" ? null : Number(rawPrice);
  if (price !== null && (Number.isNaN(price) || price < 0)) {
    return NextResponse.json(
      { error: "Price must be a valid positive number." },
      { status: 400 },
    );
  }

  const parsedDateEndRegistration = dateEndRegistration
    ? new Date(dateEndRegistration)
    : null;
  if (
    parsedDateEndRegistration &&
    Number.isNaN(parsedDateEndRegistration.getTime())
  ) {
    return NextResponse.json(
      { error: "Registration end date is invalid." },
      { status: 400 },
    );
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location,
      status,
      companyId,
      dateStart: new Date(dateStart),
      dateEnd: new Date(dateEnd),
      category: category || null,
      banner: banner || null,
      dateEndRegistration: parsedDateEndRegistration,
      typeTicket: normalizedTypeTicket,
      price,
    },
  });

  if (sessionsInput) {
    const firstRoom = await prisma.room.findFirst({
      where: { eventId: id },
      select: { id: true },
      orderBy: { name: "asc" },
    });

    const roomId = firstRoom?.id;
    if (roomId) {
      const existingSessions = await prisma.session.findMany({
        where: { eventId: id },
        select: { id: true },
      });

      const existingSessionIds = new Set(
        existingSessions.map((session) => session.id),
      );
      const incomingSessionIds = new Set<string>();

      for (const rawSession of sessionsInput) {
        const sessionId =
          typeof rawSession?.id === "string" ? rawSession.id.trim() : "";
        const title =
          typeof rawSession?.title === "string" ? rawSession.title.trim() : "";
        const description =
          typeof rawSession?.description === "string"
            ? rawSession.description.trim()
            : "";
        const speakerId =
          typeof rawSession?.speakerId === "string"
            ? rawSession.speakerId.trim()
            : "";
        const start =
          typeof rawSession?.start === "string" ? rawSession.start.trim() : "";
        const end =
          typeof rawSession?.end === "string" ? rawSession.end.trim() : "";

        if (!title || !speakerId || !start || !end) {
          continue;
        }

        const parsedStart = new Date(start);
        const parsedEnd = new Date(end);
        if (
          Number.isNaN(parsedStart.getTime()) ||
          Number.isNaN(parsedEnd.getTime())
        ) {
          continue;
        }

        if (sessionId && existingSessionIds.has(sessionId)) {
          incomingSessionIds.add(sessionId);
          await prisma.session.update({
            where: { id: sessionId },
            data: {
              title,
              description,
              speakerId,
              start: parsedStart,
              end: parsedEnd,
              roomId,
            },
          });
        } else {
          const created = await prisma.session.create({
            data: {
              eventId: id,
              roomId,
              speakerId,
              title,
              description,
              start: parsedStart,
              end: parsedEnd,
            },
            select: { id: true },
          });
          incomingSessionIds.add(created.id);
        }
      }

      const sessionsToDelete = existingSessions
        .filter((session) => !incomingSessionIds.has(session.id))
        .map((session) => session.id);

      if (sessionsToDelete.length > 0) {
        await prisma.session.deleteMany({
          where: { id: { in: sessionsToDelete } },
        });
      }
    }
  }

  if (ticketsInput) {
    const existingTickets = await prisma.ticket.findMany({
      where: { eventId: id },
      select: { id: true, type: true, userId: true },
    });

    const groupedTickets = new Map<
      TicketType,
      { soldIds: string[]; availableIds: string[] }
    >();

    for (const ticket of existingTickets) {
      const current = groupedTickets.get(ticket.type) ?? {
        soldIds: [],
        availableIds: [],
      };

      if (ticket.userId) {
        current.soldIds.push(ticket.id);
      } else {
        current.availableIds.push(ticket.id);
      }

      groupedTickets.set(ticket.type, current);
    }

    const validTicketTypes = new Set(Object.values(TicketType));
    let desiredTotalCapacity = 0;

    for (const rawTier of ticketsInput) {
      const rawType =
        typeof rawTier?.type === "string"
          ? rawTier.type.trim().toUpperCase()
          : "";
      if (!validTicketTypes.has(rawType as TicketType)) {
        continue;
      }

      const type = rawType as TicketType;
      const price = Number(rawTier?.price ?? 0);
      const capacity = Number(rawTier?.capacity ?? 0);
      if (
        Number.isNaN(price) ||
        price < 0 ||
        Number.isNaN(capacity) ||
        capacity < 0
      ) {
        continue;
      }

      const grouped = groupedTickets.get(type) ?? {
        soldIds: [],
        availableIds: [],
      };
      const soldCount = grouped.soldIds.length;
      const desiredCapacity = Math.max(capacity, soldCount);
      desiredTotalCapacity += desiredCapacity;
      const desiredAvailable = desiredCapacity - soldCount;

      if (grouped.availableIds.length > desiredAvailable) {
        const idsToDelete = grouped.availableIds.slice(desiredAvailable);
        await prisma.ticket.deleteMany({ where: { id: { in: idsToDelete } } });
      } else if (grouped.availableIds.length < desiredAvailable) {
        await prisma.ticket.createMany({
          data: Array.from({
            length: desiredAvailable - grouped.availableIds.length,
          }).map(() => ({
            eventId: id,
            type,
            price,
            status: "ACTIVE",
          })),
        });
      }

      await prisma.ticket.updateMany({
        where: {
          eventId: id,
          type,
          userId: null,
        },
        data: { price },
      });
    }

    const soldCount = await prisma.ticket.count({
      where: { eventId: id, userId: { not: null } },
    });

    const soldRevenueAggregate = await prisma.ticket.aggregate({
      where: { eventId: id, userId: { not: null } },
      _sum: { price: true },
    });

    await prisma.event.update({
      where: { id },
      data: {
        attendeesCount: desiredTotalCapacity || undefined,
        ticketsSold: soldCount,
        revenue: soldRevenueAggregate._sum.price ?? 0,
      },
    });
  }

  return NextResponse.json({ success: true, event: updatedEvent });
}
