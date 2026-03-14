import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromCookieStore } from "@/lib/jwt-auth";

export async function GET() {
  const auth = await getAuthFromCookieStore();
  const userId = auth?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });

  return NextResponse.json({ unreadCount });
}
