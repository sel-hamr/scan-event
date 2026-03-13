import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || !userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SCANNER", "ORGANISATEUR", "SUPER_ADMIN"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const eventId =
      typeof body?.eventId === "string" ? body.eventId.trim() : "";

    if (!code) {
      return NextResponse.json(
        { error: "Ticket code is required." },
        { status: 400 },
      );
    }

    const normalizedCode = code.startsWith("ticket:") ? code : `ticket:${code}`;

    let qrCode = await prisma.qrCode.findUnique({
      where: { code },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!qrCode && normalizedCode !== code) {
      qrCode = await prisma.qrCode.findUnique({
        where: { code: normalizedCode },
        include: {
          ticket: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }

    let fallbackTicket: {
      id: string;
      type: string;
      userId: string | null;
      status: "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";
      event: { id: string; title: string };
      user: { id: string; name: string; email: string } | null;
      qrCodes: { id: string; scanned: boolean; scannedAt: Date | null }[];
    } | null = null;

    if (!qrCode) {
      const ticketId = code.startsWith("ticket:") ? code.slice(7) : code;
      fallbackTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          qrCodes: {
            select: {
              id: true,
              scanned: true,
              scannedAt: true,
            },
            orderBy: {
              scannedAt: "desc",
            },
            take: 1,
          },
        },
      });
    }

    if (!qrCode && !fallbackTicket) {
      return NextResponse.json(
        { error: "Invalid ticket code." },
        { status: 404 },
      );
    }

    const resolvedEventId = qrCode
      ? qrCode.ticket.eventId
      : fallbackTicket!.event.id;
    const resolvedTicketUserId = qrCode
      ? qrCode.ticket.userId
      : fallbackTicket!.userId;
    const resolvedTicketStatus = qrCode
      ? qrCode.ticket.status
      : fallbackTicket!.status;
    const resolvedScanned = qrCode
      ? qrCode.scanned
      : (fallbackTicket!.qrCodes[0]?.scanned ?? false);
    const resolvedScannedAt = qrCode
      ? qrCode.scannedAt
      : (fallbackTicket!.qrCodes[0]?.scannedAt ?? null);

    if (eventId && resolvedEventId !== eventId) {
      return NextResponse.json(
        { error: "This ticket is not for the selected event." },
        { status: 400 },
      );
    }

    if (!resolvedTicketUserId) {
      return NextResponse.json(
        { error: "This ticket has no attendee assigned." },
        { status: 400 },
      );
    }

    if (resolvedScanned || resolvedTicketStatus === "USED") {
      const alreadyTicket = qrCode ? qrCode.ticket : fallbackTicket!;
      return NextResponse.json(
        {
          error: "Ticket already checked in.",
          alreadyScanned: true,
          ticket: {
            id: alreadyTicket.id,
            type: alreadyTicket.type,
            attendeeName: alreadyTicket.user?.name || "Unknown",
            attendeeEmail: alreadyTicket.user?.email || "",
            eventId: alreadyTicket.event.id,
            eventTitle: alreadyTicket.event.title,
            scannedAt: resolvedScannedAt,
          },
        },
        { status: 409 },
      );
    }

    const scannedAt = new Date();

    const ticketId = qrCode ? qrCode.ticket.id : fallbackTicket!.id;

    await prisma.$transaction(async (tx) => {
      if (qrCode) {
        await tx.qrCode.update({
          where: { id: qrCode.id },
          data: {
            scanned: true,
            scannedAt,
            scannedBy: userId,
          },
        });
      } else {
        await tx.qrCode.upsert({
          where: { code: `ticket:${ticketId}` },
          update: {
            scanned: true,
            scannedAt,
            scannedBy: userId,
            ticketId,
          },
          create: {
            code: `ticket:${ticketId}`,
            ticketId,
            scanned: true,
            scannedAt,
            scannedBy: userId,
          },
        });
      }

      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: "USED",
        },
      });
    });

    const validatedTicket = qrCode ? qrCode.ticket : fallbackTicket!;

    return NextResponse.json({
      success: true,
      message: "Ticket validated successfully.",
      ticket: {
        id: validatedTicket.id,
        type: validatedTicket.type,
        attendeeName: validatedTicket.user?.name || "Unknown",
        attendeeEmail: validatedTicket.user?.email || "",
        eventId: validatedTicket.event.id,
        eventTitle: validatedTicket.event.title,
        scannedAt,
      },
    });
  } catch (error) {
    console.error("Failed to validate ticket:", error);
    return NextResponse.json(
      { error: "Failed to validate ticket." },
      { status: 500 },
    );
  }
}
