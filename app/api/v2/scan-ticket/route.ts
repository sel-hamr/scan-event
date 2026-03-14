import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt-auth";
import { NotificationType } from "@prisma/client";

function extractBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

export async function POST(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const auth = await verifyAuthToken(token);
    if (!auth?.userId || !auth.role) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (auth.role !== "SCANNER") {
      return NextResponse.json(
        { error: "Forbidden. SCANNER role is required." },
        { status: 403 },
      );
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

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required." },
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
                organiserId: true,
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
                  organiserId: true,
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
      event: { id: string; title: string; organiserId: string };
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
              organiserId: true,
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

    if (resolvedEventId !== eventId) {
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
            scannedBy: auth.userId,
          },
        });
      } else {
        await tx.qrCode.upsert({
          where: { code: `ticket:${ticketId}` },
          update: {
            scanned: true,
            scannedAt,
            scannedBy: auth.userId,
            ticketId,
          },
          create: {
            code: `ticket:${ticketId}`,
            ticketId,
            scanned: true,
            scannedAt,
            scannedBy: auth.userId,
          },
        });
      }

      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: "USED",
        },
      });

      const ticketSource = qrCode ? qrCode.ticket : fallbackTicket!;
      const notificationTargets = [
        {
          userId: resolvedTicketUserId,
          title: "Ticket checked in",
          body: `Your ticket for \"${ticketSource.event.title}\" was scanned successfully.`,
          type: NotificationType.SUCCESS,
        },
        ...(ticketSource.event.organiserId &&
        ticketSource.event.organiserId !== resolvedTicketUserId
          ? [
              {
                userId: ticketSource.event.organiserId,
                title: "Attendee checked in",
                body: `A ticket was scanned for \"${ticketSource.event.title}\".`,
                type: NotificationType.INFO,
              },
            ]
          : []),
      ];

      await tx.notification.createMany({
        data: notificationTargets,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to validate ticket." },
      { status: 500 },
    );
  }
}
