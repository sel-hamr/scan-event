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

export async function POST(request: Request) {
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

    const receiverId =
      typeof body?.receiverId === "string" ? body.receiverId.trim() : "";
    const messageInput =
      typeof body?.message === "string" ? body.message.trim() : "";
    const eventIdInput =
      typeof body?.eventId === "string" ? body.eventId.trim() : "";

    if (!receiverId || receiverId === auth.userId) {
      return NextResponse.json({ error: "Invalid receiver." }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const existingRequest = await prisma.networkingRequest.findFirst({
      where: {
        OR: [
          { senderId: auth.userId, receiverId },
          { senderId: receiverId, receiverId: auth.userId },
        ],
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
      select: { id: true, status: true },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            existingRequest.status === "ACCEPTED"
              ? "You are already connected with this user."
              : "A pending request already exists with this user.",
        },
        { status: 409 },
      );
    }

    const event = eventIdInput
      ? await prisma.event.findUnique({
          where: { id: eventIdInput },
          select: { id: true },
        })
      : await prisma.event.findFirst({
          orderBy: { dateStart: "desc" },
          select: { id: true },
        });

    if (!event) {
      return NextResponse.json(
        { error: "No event available for networking request." },
        { status: 400 },
      );
    }

    const networkingRequest = await prisma.networkingRequest.create({
      data: {
        senderId: auth.userId,
        receiverId,
        eventId: event.id,
        message: messageInput || "I'd like to connect with you.",
        status: "PENDING",
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
    });

    return NextResponse.json({
      success: true,
      request: networkingRequest,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
