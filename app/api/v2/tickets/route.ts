import { Prisma, TicketStatus, TicketType } from "@prisma/client";
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
    const typeParam = searchParams.get("type")?.trim().toUpperCase() ?? "";
    const eventId = searchParams.get("eventId")?.trim() ?? "";
    const from = toDate(searchParams.get("from"));
    const to = toDate(searchParams.get("to"));
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 20), 100);

    const where: Prisma.TicketWhereInput = {
      userId: auth.userId,
    };

    if (statusParam && statusParam in TicketStatus) {
      where.status = statusParam as TicketStatus;
    }

    if (typeParam && typeParam in TicketType) {
      where.type = typeParam as TicketType;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (q || from || to) {
      where.event = {
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { location: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(from || to
          ? {
              dateStart: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      };
    }

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
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
              location: true,
              status: true,
              dateStart: true,
              dateEnd: true,
              banner: true,
            },
          },
        },
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      filters: {
        q: q || null,
        status: statusParam || null,
        type: typeParam || null,
        eventId: eventId || null,
        from: from?.toISOString() ?? null,
        to: to?.toISOString() ?? null,
      },
      tickets,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
