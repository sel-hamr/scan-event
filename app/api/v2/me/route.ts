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

    const events = includeEvents
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
          },
          orderBy: { dateStart: "desc" },
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
