import { EventStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt-auth";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const auth = await verifyAuthToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const accessWhere =
      user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ORGANISATEUR
        ? { id }
        : {
            id,
            status: {
              in: [
                EventStatus.PUBLISHED,
                EventStatus.ONGOING,
                EventStatus.COMPLETED,
              ],
            },
          };

    const event = await prisma.event.findFirst({
      where: accessWhere,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        status: true,
        category: true,
        dateStart: true,
        dateEnd: true,
        banner: true,
        attendeesCount: true,
        ticketsSold: true,
        revenue: true,
        dateEndRegistration: true,
        typeTicket: true,
        price: true,
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            website: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        sponsors: {
          select: {
            id: true,
            name: true,
            company: true,
            tier: true,
            logo: true,
          },
          orderBy: { name: "asc" },
        },
        exposants: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            standNumber: true,
          },
          orderBy: { name: "asc" },
        },
        sessions: {
          select: {
            id: true,
            title: true,
            description: true,
            start: true,
            end: true,
            room: {
              select: {
                id: true,
                name: true,
                capacity: true,
              },
            },
            speaker: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                topic: true,
                company: true,
              },
            },
          },
          orderBy: { start: "asc" },
        },
        tickets: {
          select: {
            id: true,
            eventId: true,
            type: true,
            price: true,
            status: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { id: "desc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const speakersById = new Map<
      string,
      (typeof event.sessions)[number]["speaker"]
    >();

    for (const session of event.sessions) {
      if (session.speaker && !speakersById.has(session.speaker.id)) {
        speakersById.set(session.speaker.id, session.speaker);
      }
    }

    const ticketCounts = event.tickets.reduce(
      (acc, ticket) => {
        acc.total += 1;

        if (ticket.userId) {
          acc.sold += 1;
        } else {
          acc.available += 1;
        }

        acc.byStatus[ticket.status] = (acc.byStatus[ticket.status] ?? 0) + 1;
        acc.byType[ticket.type] = (acc.byType[ticket.type] ?? 0) + 1;

        return acc;
      },
      {
        total: 0,
        sold: 0,
        available: 0,
        byStatus: {
          ACTIVE: 0,
          USED: 0,
          CANCELLED: 0,
          EXPIRED: 0,
        },
        byType: {
          STANDARD: 0,
          VIP: 0,
          FREE: 0,
          EARLY_BIRD: 0,
        },
      },
    );

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        ticketCounts,
        speakers: Array.from(speakersById.values()),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
