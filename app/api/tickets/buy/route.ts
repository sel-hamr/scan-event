import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationType, TicketType } from "@prisma/client";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

const validTicketTypes = new Set<TicketType>([
  TicketType.VIP,
  TicketType.STANDARD,
  TicketType.FREE,
  TicketType.EARLY_BIRD,
]);

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromCookieStore();
    const userId = auth?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";
    const requestedTicketType =
      typeof body?.ticketType === "string" ? body.ticketType.toUpperCase() : "";
    const ticketType = requestedTicketType as TicketType;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 },
      );
    }

    if (!validTicketTypes.has(ticketType)) {
      return NextResponse.json(
        { error: "Ticket type is required" },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        organiserId: true,
        attendeesCount: true,
        ticketsSold: true,
        price: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: {
        userId,
        eventId,
        status: {
          in: ["ACTIVE", "USED"],
        },
      },
      select: { id: true },
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: "You already have a ticket for this event" },
        { status: 400 },
      );
    }

    const availableTicket = await prisma.ticket.findFirst({
      where: {
        eventId,
        type: ticketType,
        userId: null,
        status: "ACTIVE",
      },
      orderBy: {
        price: "asc",
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (!availableTicket) {
      return NextResponse.json(
        { error: "Selected ticket type is sold out" },
        { status: 400 },
      );
    }

    const price = availableTicket.price;

    const ticket = await prisma.$transaction(async (tx) => {
      const assigned = await tx.ticket.update({
        where: { id: availableTicket.id },
        data: {
          userId,
        },
      });

      const existingQrCode = await tx.qrCode.findFirst({
        where: {
          ticketId: assigned.id,
        },
        select: {
          id: true,
        },
      });

      if (!existingQrCode) {
        await tx.qrCode.create({
          data: {
            ticketId: assigned.id,
            code: `ticket:${assigned.id}`,
          },
        });
      }

      await tx.event.update({
        where: { id: eventId },
        data: {
          ticketsSold: {
            increment: 1,
          },
          revenue: {
            increment: price,
          },
        },
      });

      const notificationTargets = [
        {
          userId,
          title: "Ticket purchased",
          body: `You bought a ${ticketType} ticket for \"${event.title}\".`,
          type: NotificationType.SUCCESS,
        },
        ...(event.organiserId && event.organiserId !== userId
          ? [
              {
                userId: event.organiserId,
                title: "New ticket sold",
                body: `A ${ticketType} ticket was purchased for \"${event.title}\".`,
                type: NotificationType.INFO,
              },
            ]
          : []),
      ];

      await tx.notification.createMany({
        data: notificationTargets,
      });

      return assigned;
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to buy ticket" },
      { status: 500 },
    );
  }
}
