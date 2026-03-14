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

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
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
          price: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dateStart: "asc" },
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
        location: location || null,
        category: category || null,
        companyId: companyId || null,
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
