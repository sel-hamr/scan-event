import { PrismaClient, UserRole, EventStatus, TicketStatus, TicketType, SponsorTier, RegistrationStatus, NotificationType, NetworkingRequestStatus } from "@prisma/client";
import {
  currentUser,
  mockCompanies,
  mockEvents,
  mockRooms,
  mockSessions,
  mockTickets,
  mockSpeakers,
  mockExposants,
  mockSponsors,
  mockRegistrations,
  mockNotifications,
  mockNetworking
} from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up database...");
  await prisma.networkingRequest.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.exposant.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.room.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log("Seeding companies...");
  for (const comp of mockCompanies) {
    await prisma.company.create({
      data: {
        id: comp.id,
        name: comp.name,
        description: comp.description,
        email: comp.email,
        website: comp.website,
        address: comp.address,
        createdAt: new Date(comp.created_at),
      }
    });
  }

  console.log("Seeding users...");
  // Create current user
  await prisma.user.create({
    data: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role.toUpperCase() as UserRole,
      avatar: currentUser.avatar,
      phone: currentUser.phone,
      companyId: currentUser.company_id,
    }
  });

  // Extract other mock users from tickets, registrations, etc.
  const additionalUsers = [
    { id: "usr_010", name: "John Smith", email: "john@smith.com" },
    { id: "usr_011", name: "Emma Wilson", email: "emma@wilson.co" },
    { id: "usr_012", name: "Omar Hassan", email: "omar@hassan.dev" },
    { id: "usr_013", name: "Lisa Chen", email: "lisa@chen.ai" },
    { id: "usr_014", name: "Youssef Alami", email: "youssef@alami.ma" },
    { id: "usr_015", name: "Sophie Martin", email: "sophie@martin.com" },
    { id: "usr_016", name: "Alex Johnson", email: "alex@johnson.com" },
    { id: "usr_017", name: "Maria Garcia", email: "maria@garcia.com" },
  ];

  for (const u of additionalUsers) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: "PARTICIPANT",
      }
    });
  }

  console.log("Seeding events...");
  for (const evt of mockEvents) {
    await prisma.event.create({
      data: {
        id: evt.id,
        title: evt.title,
        dateStart: new Date(evt.date_start),
        dateEnd: new Date(evt.date_end),
        location: evt.location,
        status: evt.status.toUpperCase() as EventStatus,
        organiserId: evt.organiser_id,
        description: evt.description,
        companyId: evt.company_id,
        attendeesCount: evt.attendees_count,
        ticketsSold: evt.tickets_sold,
        revenue: evt.revenue,
      }
    });
  }

  console.log("Seeding speakers...");
  for (const spk of mockSpeakers) {
    await prisma.speaker.create({
      data: {
        id: spk.id,
        name: spk.name,
        email: spk.email,
        avatar: spk.avatar,
        bio: spk.bio,
        topic: spk.topic,
        company: spk.company,
        eventsCount: spk.events_count,
      }
    });
  }

  console.log("Seeding rooms...");
  for (const room of mockRooms) {
    await prisma.room.create({
      data: {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        eventId: room.event_id,
      }
    });
  }

  console.log("Seeding sessions...");
  for (const sess of mockSessions) {
    await prisma.session.create({
      data: {
        id: sess.id,
        title: sess.title,
        start: new Date(sess.start),
        end: new Date(sess.end),
        roomId: sess.room_id,
        eventId: sess.event_id,
        speakerId: sess.speaker_id,
      }
    });
  }

  console.log("Seeding tickets...");
  for (const tkt of mockTickets) {
    await prisma.ticket.create({
      data: {
        id: tkt.id,
        userId: tkt.user_id,
        eventId: tkt.event_id,
        type: tkt.type.toUpperCase() as TicketType,
        price: tkt.price,
        status: tkt.status.toUpperCase() as TicketStatus,
      }
    });
  }

  console.log("Seeding exposants...");
  for (const exp of mockExposants) {
    await prisma.exposant.create({
      data: {
        id: exp.id,
        name: exp.name,
        email: exp.email,
        company: exp.company,
        standNumber: exp.stand_number,
        eventId: exp.event_id,
      }
    });
  }

  console.log("Seeding sponsors...");
  for (const spon of mockSponsors) {
    await prisma.sponsor.create({
      data: {
        id: spon.id,
        name: spon.name,
        company: spon.company,
        tier: spon.tier.toUpperCase() as SponsorTier,
        eventId: spon.event_id,
      }
    });
  }

  console.log("Seeding registrations...");
  for (const reg of mockRegistrations) {
    await prisma.registration.create({
      data: {
        id: reg.id,
        userId: reg.user_id,
        eventId: reg.event_id,
        status: reg.status.toUpperCase() as RegistrationStatus,
        registeredAt: new Date(reg.registered_at),
      }
    });
  }

  console.log("Seeding notifications...");
  for (const notif of mockNotifications) {
    await prisma.notification.create({
      data: {
        id: notif.id,
        userId: notif.user_id,
        title: notif.title,
        body: notif.body,
        read: notif.read,
        type: notif.type.toUpperCase() as NotificationType,
        createdAt: new Date(notif.created_at),
      }
    });
  }

  console.log("Seeding networking requests...");
  for (const net of mockNetworking) {
    await prisma.networkingRequest.create({
      data: {
        id: net.id,
        senderId: net.sender_id,
        receiverId: net.receiver_id,
        eventId: net.event_id,
        status: net.status.toUpperCase() as NetworkingRequestStatus,
        message: net.message,
        createdAt: new Date(net.created_at),
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
