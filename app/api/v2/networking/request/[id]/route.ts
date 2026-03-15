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

export async function PATCH(
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

    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const rawAction =
      typeof body?.action === "string"
        ? body.action.trim().toUpperCase()
        : typeof body?.status === "string"
          ? body.status.trim().toUpperCase()
          : "";

    const nextStatus =
      rawAction === "ACCEPT" || rawAction === "ACCEPTED"
        ? "ACCEPTED"
        : rawAction === "REFUSE" ||
            rawAction === "REFUSED" ||
            rawAction === "REJECT" ||
            rawAction === "REJECTED"
          ? "REJECTED"
          : null;

    if (!nextStatus) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use action/status: ACCEPT (or ACCEPTED) / REFUSE (or REJECT).",
        },
        { status: 400 },
      );
    }

    const existingRequest = await prisma.networkingRequest.findUnique({
      where: { id },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        status: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Networking request not found." },
        { status: 404 },
      );
    }

    if (existingRequest.receiverId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. Only request receiver can update status." },
        { status: 403 },
      );
    }

    if (existingRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending requests can be updated." },
        { status: 409 },
      );
    }

    const updatedRequest = await prisma.networkingRequest.update({
      where: { id },
      data: { status: nextStatus },
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
      request: updatedRequest,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
