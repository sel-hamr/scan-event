import { EventStatus, Prisma } from "@prisma/client";
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

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

function toDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const auth = await verifyAuthToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const q = searchParams.get("q")?.trim() ?? "";
    const statusParam = searchParams.get("status")?.trim().toUpperCase() ?? "";
    const location = searchParams.get("location")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const companyId = searchParams.get("companyId")?.trim() ?? "";
    const withSpeaker =
      searchParams.get("speaker")?.trim().toLowerCase() === "true";
    const withSession =
      searchParams.get("withsession")?.trim().toLowerCase() === "true";
    const from = toDate(searchParams.get("from"));
    const to = toDate(searchParams.get("to"));
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 20), 100);
    const now = new Date();

    const where: Prisma.EventWhereInput = {
      status: {
        in: [EventStatus.PUBLISHED, EventStatus.ONGOING],
      },
      dateEnd: {
        gte: now,
      },
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" };
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (statusParam && statusParam in EventStatus) {
      where.status = statusParam as EventStatus;
    }

    if (from || to) {
      where.dateStart = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const shouldLoadSessions = withSpeaker || withSession;

    const eventSelect: Prisma.EventSelect = {
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
      price: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    };

    if (shouldLoadSessions) {
      (eventSelect as any).sessions = {
        select: {
          id: true,
          title: true,
          description: true,
          start: true,
          end: true,
          ...(withSession
            ? {
                room: {
                  select: {
                    id: true,
                    name: true,
                    capacity: true,
                  },
                },
              }
            : {}),
          ...(withSpeaker
            ? {
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
              }
            : {}),
        },
        orderBy: {
          start: "asc",
        },
      };
    }

    const [total, rawEvents] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        select: eventSelect,
        orderBy: { dateStart: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const events = rawEvents.map((event: any) => {
      const sessions = Array.isArray(event.sessions) ? event.sessions : [];

      const nextEvent: Record<string, unknown> = {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        category: event.category,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
        banner: event.banner,
        attendeesCount: event.attendeesCount,
        ticketsSold: event.ticketsSold,
        price: event.price,
        company: event.company,
      };

      if (withSession) {
        nextEvent.sessions = sessions;
      }

      if (withSpeaker) {
        const speakersById = new Map<string, any>();

        for (const session of sessions) {
          if (session.speaker && !speakersById.has(session.speaker.id)) {
            speakersById.set(session.speaker.id, session.speaker);
          }
        }

        nextEvent.speakers = Array.from(speakersById.values());
      }

      return nextEvent;
    });

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      filters: {
        q: q || null,
        status: statusParam || null,
        location: location || null,
        category: category || null,
        companyId: companyId || null,
        speaker: withSpeaker,
        withsession: withSession,
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
      },
      events,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
