import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const eventId = typeof body?.eventId === "string" ? body.eventId : "";

    if (!eventId) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
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
      return NextResponse.json({ error: "Tickets sold out" }, { status: 400 });
    }

    const price = availableTicket.price;

    const ticket = await prisma.$transaction(async (tx) => {
      const assigned = await tx.ticket.update({
        where: { id: availableTicket.id },
        data: {
          userId,
        },
      });

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
