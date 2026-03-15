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
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 20), 100);

    const hasRequestParam = searchParams
      .get("hasRequest")
      ?.trim()
      .toLowerCase();
    const hasRequestFilter =
      hasRequestParam === "true"
        ? true
        : hasRequestParam === "false"
          ? false
          : null;

    const users = await prisma.user.findMany({
      where: {
        id: { not: auth.userId },
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                {
                  company: {
                    is: {
                      name: { contains: q, mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const userIds = users.map((user) => user.id);

    const requests =
      userIds.length > 0
        ? await prisma.networkingRequest.findMany({
            where: {
              OR: [
                {
                  senderId: auth.userId,
                  receiverId: { in: userIds },
                },
                {
                  senderId: { in: userIds },
                  receiverId: auth.userId,
                },
              ],
            },
            select: {
              id: true,
              senderId: true,
              receiverId: true,
              status: true,
              message: true,
              eventId: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          })
        : [];

    const latestRequestByUserId = new Map<string, (typeof requests)[number]>();

    for (const requestRow of requests) {
      const otherUserId =
        requestRow.senderId === auth.userId
          ? requestRow.receiverId
          : requestRow.senderId;

      if (!latestRequestByUserId.has(otherUserId)) {
        latestRequestByUserId.set(otherUserId, requestRow);
      }
    }

    const usersWithRequestInfo = users.map((user) => {
      const requestRow = latestRequestByUserId.get(user.id) ?? null;
      const hasRequest = !!requestRow;

      return {
        ...user,
        hasRequest,
        request: requestRow
          ? {
              id: requestRow.id,
              status: requestRow.status,
              direction:
                requestRow.senderId === auth.userId ? "OUTGOING" : "INCOMING",
              senderId: requestRow.senderId,
              receiverId: requestRow.receiverId,
              message: requestRow.message,
              eventId: requestRow.eventId,
              createdAt: requestRow.createdAt,
            }
          : null,
      };
    });

    const filteredUsers =
      hasRequestFilter === null
        ? usersWithRequestInfo
        : usersWithRequestInfo.filter(
            (user) => user.hasRequest === hasRequestFilter,
          );

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const pagedUsers = filteredUsers.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      filters: {
        q: q || null,
        hasRequest: hasRequestFilter,
      },
      users: pagedUsers,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
