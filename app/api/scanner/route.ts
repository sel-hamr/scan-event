import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") || "";

  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      ticketsSold: true,
    },
    orderBy: { dateStart: "desc" },
  });

  const selectedEventId = eventId || events[0]?.id;

  const tickets = selectedEventId
    ? await prisma.ticket.findMany({
        where: {
          eventId: selectedEventId,
          status: "ACTIVE",
          userId: { not: null },
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })
    : [];

  return NextResponse.json({
    events,
    selectedEventId,
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      eventId: ticket.eventId,
      userName: ticket.user?.name || "Unknown",
    })),
  });
}
