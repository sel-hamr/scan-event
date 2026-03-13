import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MonthRow = {
  month: string;
  revenue: number;
  tickets: number;
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function GET() {
  const [
    totalEvents,
    soldTickets,
    revenueAggregate,
    attendeesAggregate,
    recentRegistrations,
    upcomingEvents,
    recentEventsForChart,
    soldTicketsByType,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.ticket.count({ where: { userId: { not: null } } }),
    prisma.event.aggregate({ _sum: { revenue: true } }),
    prisma.event.aggregate({
      _sum: { attendeesCount: true, ticketsSold: true },
    }),
    prisma.registration.findMany({
      take: 5,
      orderBy: { registeredAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        status: { not: "COMPLETED" },
      },
      take: 4,
      orderBy: { dateStart: "asc" },
      select: {
        id: true,
        title: true,
        dateStart: true,
        location: true,
        ticketsSold: true,
        attendeesCount: true,
      },
    }),
    prisma.event.findMany({
      where: {
        dateStart: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
        },
      },
      select: {
        dateStart: true,
        revenue: true,
        ticketsSold: true,
      },
    }),
    prisma.ticket.groupBy({
      by: ["type"],
      where: {
        userId: { not: null },
      },
      _count: {
        type: true,
      },
    }),
  ]);

  const monthBuckets = new Map<string, MonthRow>();
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthBuckets.set(key, {
      month: monthLabels[date.getMonth()],
      revenue: 0,
      tickets: 0,
    });
  }

  for (const event of recentEventsForChart) {
    const date = new Date(event.dateStart);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthBuckets.get(key);
    if (!bucket) continue;
    bucket.revenue += event.revenue ?? 0;
    bucket.tickets += event.ticketsSold ?? 0;
  }

  const ticketTypeColors: Record<string, string> = {
    VIP: "var(--chart-1)",
    STANDARD: "var(--chart-2)",
    FREE: "var(--chart-3)",
    EARLY_BIRD: "var(--chart-4)",
  };

  const totalAttendeesCapacity = attendeesAggregate._sum.attendeesCount ?? 0;
  const totalTicketsSold = attendeesAggregate._sum.ticketsSold ?? 0;

  return NextResponse.json({
    kpiData: {
      totalEvents: totalEvents,
      ticketsSold: soldTickets,
      totalRevenue: revenueAggregate._sum.revenue ?? 0,
      attendanceRate:
        totalAttendeesCapacity > 0
          ? Math.round((totalTicketsSold / totalAttendeesCapacity) * 100)
          : 0,
    },
    monthlyEventData: Array.from(monthBuckets.values()),
    ticketTypeData: soldTicketsByType.map((row) => ({
      type: row.type.replace("_", " "),
      count: row._count.type,
      fill: ticketTypeColors[row.type] ?? "var(--chart-5)",
    })),
    recentRegistrations: recentRegistrations.map((registration) => ({
      id: registration.id,
      status: registration.status,
      userName: registration.user.name,
      userEmail: registration.user.email,
      eventTitle: registration.event.title,
    })),
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      dateStart: event.dateStart,
      location: event.location,
      ticketsSold: event.ticketsSold,
      attendeesCount: event.attendeesCount,
    })),
  });
}
