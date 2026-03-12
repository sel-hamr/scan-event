import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        dateStart: 'desc'
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, dateStart, dateEnd, location, companyId, description, sessions, tickets } = data;

    // Use the first user as organiser for now
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No user found in database to act as organiser" }, { status: 400 });
    }

    const totalCapacity = tickets ? tickets.reduce((acc: number, t: any) => acc + (parseInt(t.capacity) || 0), 0) : 0;

    const event = await prisma.event.create({
      data: {
        title,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
        location: location || "TBD",
        description: description || "",
        companyId,
        organiserId: user.id,
        attendeesCount: totalCapacity,
        rooms: {
          create: [{
            name: "Main Hall",
            capacity: Math.max(500, totalCapacity)
          }]
        }
      },
      include: {
        rooms: true
      }
    });

    const defaultRoomId = event.rooms[0].id;

    if (sessions && sessions.length > 0) {
      await prisma.session.createMany({
        data: sessions.map((s: any) => ({
          title: s.title,
          description: s.description || "",
          start: new Date(`${dateStart}T${s.start}:00`),
          end: new Date(`${dateStart}T${s.end}:00`),
          roomId: defaultRoomId,
          eventId: event.id,
          speakerId: s.speaker,
        }))
      });
    }

    if (tickets && tickets.length > 0) {
      const ticketRecords: any[] = [];
      for (const t of tickets) {
        const capacity = parseInt(t.capacity) || 0;
        const typeMap: Record<string, string> = {
          standard: "STANDARD",
          vip: "VIP",
          early_bird: "EARLY_BIRD",
          free: "FREE"
        };
        const ticketType = typeMap[t.type] || "STANDARD";
        const price = parseFloat(t.price) || 0;

        for (let i = 0; i < capacity; i++) {
          ticketRecords.push({
            eventId: event.id,
            userId: user.id, // satisfying db constraint
            type: ticketType as any,
            price: price,
            status: "ACTIVE",
          });
        }
      }
      
      if (ticketRecords.length > 0) {
        await prisma.ticket.createMany({
          data: ticketRecords
        });
      }
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create event" }, { status: 500 });
  }
}
