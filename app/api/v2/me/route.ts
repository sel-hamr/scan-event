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

export async function GET(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));
    const url = new URL(request.url);
    const includeTickets =
      url.searchParams.get("ticket")?.toLowerCase() === "true";
    const includeEvents =
      url.searchParams.get("event")?.toLowerCase() === "true";
    const includeSpeakers =
      includeEvents &&
      url.searchParams.get("speaker")?.toLowerCase() === "true";
    const includeSponsors =
      includeEvents &&
      url.searchParams.get("sponsor")?.toLowerCase() === "true";
    const includeExposants =
      includeEvents &&
      url.searchParams.get("exposant")?.toLowerCase() === "true";
    const includeSessions =
      url.searchParams.get("withsession")?.toLowerCase() === "true";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const auth = await verifyAuthToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const tickets = includeTickets
      ? await prisma.ticket.findMany({
          where: { userId: auth.userId },
          select: {
            id: true,
            eventId: true,
            type: true,
            price: true,
            status: true,
            event: {
              select: {
                id: true,
                title: true,
                dateStart: true,
                dateEnd: true,
                location: true,
              },
            },
          },
          orderBy: { id: "desc" },
        })
      : null;

    const shouldLoadEventSessions =
      includeEvents && (includeSpeakers || includeSessions);

    const rawEvents = includeEvents
      ? await prisma.event.findMany({
          where: {
            OR: [
              { organiserId: auth.userId },
              { tickets: { some: { userId: auth.userId } } },
            ],
          },
          select: {
            id: true,
            title: true,
            dateStart: true,
            dateEnd: true,
            location: true,
            status: true,
            organiserId: true,
            ...(shouldLoadEventSessions
              ? {
                  sessions: {
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      start: true,
                      end: true,
                      ...(includeSessions
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
                      ...(includeSpeakers
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
                    orderBy: { start: "asc" },
                  },
                }
              : {}),
            ...(includeSponsors
              ? {
                  sponsors: {
                    select: {
                      id: true,
                      name: true,
                      company: true,
                      tier: true,
                      logo: true,
                    },
                  },
                }
              : {}),
            ...(includeExposants
              ? {
                  exposants: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      company: true,
                      standNumber: true,
                    },
                  },
                }
              : {}),
          },
          orderBy: { dateStart: "desc" },
        })
      : null;

    const events = rawEvents
      ? rawEvents.map((event: any) => {
          const eventPayload: Record<string, unknown> = {
            id: event.id,
            title: event.title,
            dateStart: event.dateStart,
            dateEnd: event.dateEnd,
            location: event.location,
            status: event.status,
            organiserId: event.organiserId,
          };

          const sessions = Array.isArray(event.sessions) ? event.sessions : [];

          if (includeSessions) {
            eventPayload.sessions = sessions;
          }

          if (includeSpeakers) {
            const speakersById = new Map<string, any>();

            for (const session of sessions) {
              if (session.speaker && !speakersById.has(session.speaker.id)) {
                speakersById.set(session.speaker.id, session.speaker);
              }
            }

            eventPayload.speakers = Array.from(speakersById.values());
          }

          if (includeSponsors) {
            eventPayload.sponsors = Array.isArray(event.sponsors)
              ? event.sponsors
              : [];
          }

          if (includeExposants) {
            eventPayload.exposants = Array.isArray(event.exposants)
              ? event.exposants
              : [];
          }

          return eventPayload;
        })
      : null;

    return NextResponse.json({
      success: true,
      user,
      ...(includeTickets ? { tickets } : {}),
      ...(includeEvents ? { events } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const token = extractBearerToken(request.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const auth = await verifyAuthToken(token);
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const avatar = typeof body?.avatar === "string" ? body.avatar.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name,
        phone: phone || null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
