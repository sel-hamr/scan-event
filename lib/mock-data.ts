// Mock data for the Event Management Platform
// In production, this would come from Prisma/PostgreSQL

export type UserRole =
  | "participant"
  | "organisateur"
  | "scanner"
  | "exposant"
  | "speaker"
  | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  company_id?: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  phone?: string;
  email: string;
  address?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  date_start: string;
  date_end: string;
  location: string;
  status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  organiser_id: string;
  description: string;
  banner?: string;
  company_id: string;
  attendees_count: number;
  tickets_sold: number;
  revenue: number;
  category?: string;
  date_end_registration: string;
  date_with_hours: string;
  type_ticket: string;
  price: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  event_id: string;
}

export interface Session {
  id: string;
  title: string;
  start: string;
  end: string;
  room_id: string;
  event_id: string;
  speaker_id: string;
  speaker_name?: string;
  room_name?: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  type: "vip" | "standard" | "free" | "early_bird";
  price: number;
  status: "active" | "used" | "cancelled" | "expired";
  user_name?: string;
  event_title?: string;
}

export interface QrCode {
  id: string;
  ticket_id: string;
  code: string;
  scanned: boolean;
  scanned_by?: string;
  scanned_at?: string;
}

export interface Speaker {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  topic: string;
  company?: string;
  events_count: number;
}

export interface Exposant {
  id: string;
  name: string;
  email: string;
  company: string;
  stand_number: string;
  event_id: string;
  event_title?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  company: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  event_id: string;
  event_title?: string;
  logo?: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: "confirmed" | "pending" | "cancelled";
  registered_at: string;
  user_name?: string;
  user_email?: string;
  event_title?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  created_at: string;
}

export interface NetworkingRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  event_id: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  sender_name?: string;
  receiver_name?: string;
  event_title?: string;
  created_at: string;
}

// ── Mock Data ──

export const currentUser: User = {
  id: "usr_001",
  name: "Sarah El-Hamri",
  email: "sarah@orcheo.io",
  role: "super_admin",
  avatar: "",
  phone: "+212 6 12 34 56 78",
  company_id: "comp_001",
};

export const mockCompanies: Company[] = [
  {
    id: "comp_001",
    name: "orcheo Inc.",
    description: "Leading event management platform",
    email: "contact@orcheo.io",
    website: "https://orcheo.io",
    address: "Casablanca, Morocco",
    created_at: "2024-01-15",
  },
  {
    id: "comp_002",
    name: "TechConf Global",
    description: "Technology conference organizer",
    email: "info@techconf.com",
    website: "https://techconf.com",
    address: "Paris, France",
    created_at: "2024-03-20",
  },
  {
    id: "comp_003",
    name: "Startup Hub",
    description: "Startup ecosystem events",
    email: "hello@startuphub.co",
    website: "https://startuphub.co",
    address: "London, UK",
    created_at: "2024-06-10",
  },
];

export const mockEvents: Event[] = [
  {
    id: "evt_001",
    title: "DevFest Morocco 2026",
    date_start: "2026-04-15",
    date_end: "2026-04-17",
    location: "Casablanca Convention Center",
    status: "published",
    organiser_id: "usr_001",
    description:
      "The biggest developer festival in Morocco featuring talks, workshops, and networking.",
    company_id: "comp_001",
    attendees_count: 1250,
    tickets_sold: 1480,
    revenue: 89400,
    date_end_registration: "2026-04-10",
    date_with_hours: "09:00 - 18:00",
    type_ticket: "Standard, VIP",
    price: 50,
  },
  {
    id: "evt_002",
    title: "AI Summit Paris",
    date_start: "2026-05-20",
    date_end: "2026-05-22",
    location: "Palais des Congrès, Paris",
    status: "draft",
    organiser_id: "usr_001",
    description:
      "Exploring the frontiers of artificial intelligence with industry leaders.",
    company_id: "comp_002",
    attendees_count: 0,
    tickets_sold: 320,
    revenue: 48000,
    date_end_registration: "2026-05-15",
    date_with_hours: "10:00 - 17:00",
    type_ticket: "Standard",
    price: 150,
  },
  {
    id: "evt_003",
    title: "Startup Weekend Rabat",
    date_start: "2026-03-28",
    date_end: "2026-03-30",
    location: "Technopark Rabat",
    status: "ongoing",
    organiser_id: "usr_001",
    description: "54 hours to build a startup from scratch.",
    company_id: "comp_003",
    attendees_count: 180,
    tickets_sold: 200,
    revenue: 6000,
    date_end_registration: "2026-03-25",
    date_with_hours: "18:00 - 21:00",
    type_ticket: "Free",
    price: 0,
  },
  {
    id: "evt_004",
    title: "Web3 Conference Dubai",
    date_start: "2026-06-10",
    date_end: "2026-06-12",
    location: "Dubai World Trade Centre",
    status: "published",
    organiser_id: "usr_001",
    description: "The future of decentralized technologies.",
    company_id: "comp_001",
    attendees_count: 0,
    tickets_sold: 890,
    revenue: 178000,
    date_end_registration: "2026-06-05",
    date_with_hours: "09:00 - 16:00",
    type_ticket: "Standard, VIP",
    price: 100,
  },
  {
    id: "evt_005",
    title: "UX Design Week",
    date_start: "2026-02-01",
    date_end: "2026-02-05",
    location: "Amsterdam RAI",
    status: "completed",
    organiser_id: "usr_001",
    description: "A week dedicated to user experience design.",
    company_id: "comp_002",
    attendees_count: 450,
    tickets_sold: 500,
    revenue: 37500,
    date_end_registration: "2026-01-25",
    date_with_hours: "09:00 - 18:00",
    type_ticket: "Standard",
    price: 75,
  },
  {
    id: "evt_006",
    title: "Cloud Native Summit",
    date_start: "2026-07-15",
    date_end: "2026-07-17",
    location: "Berlin Congress Center",
    status: "draft",
    organiser_id: "usr_001",
    description: "Cloud-native technologies and Kubernetes ecosystem.",
    company_id: "comp_001",
    attendees_count: 0,
    tickets_sold: 0,
    revenue: 0,
    date_end_registration: "2026-07-10",
    date_with_hours: "09:00 - 17:00",
    type_ticket: "Standard",
    price: 120,
  },
];

export const mockRooms: Room[] = [
  { id: "room_001", name: "Main Hall", capacity: 500, event_id: "evt_001" },
  {
    id: "room_002",
    name: "Workshop Room A",
    capacity: 50,
    event_id: "evt_001",
  },
  {
    id: "room_003",
    name: "Workshop Room B",
    capacity: 50,
    event_id: "evt_001",
  },
  { id: "room_004", name: "Keynote Stage", capacity: 800, event_id: "evt_002" },
  {
    id: "room_005",
    name: "Breakout Room 1",
    capacity: 100,
    event_id: "evt_002",
  },
];

export const mockSessions: Session[] = [
  {
    id: "sess_001",
    title: "Opening Keynote: The Future of Dev",
    start: "2026-04-15T09:00:00",
    end: "2026-04-15T10:00:00",
    room_id: "room_001",
    event_id: "evt_001",
    speaker_id: "spk_001",
    speaker_name: "Ahmed Benali",
    room_name: "Main Hall",
  },
  {
    id: "sess_002",
    title: "Building Scalable APIs with Next.js",
    start: "2026-04-15T10:30:00",
    end: "2026-04-15T12:00:00",
    room_id: "room_002",
    event_id: "evt_001",
    speaker_id: "spk_002",
    speaker_name: "Marie Dupont",
    room_name: "Workshop Room A",
  },
  {
    id: "sess_003",
    title: "AI-Powered Design Systems",
    start: "2026-04-15T14:00:00",
    end: "2026-04-15T15:30:00",
    room_id: "room_003",
    event_id: "evt_001",
    speaker_id: "spk_003",
    speaker_name: "Carlos Rivera",
    room_name: "Workshop Room B",
  },
  {
    id: "sess_004",
    title: "Cloud Infrastructure at Scale",
    start: "2026-04-16T09:00:00",
    end: "2026-04-16T10:30:00",
    room_id: "room_001",
    event_id: "evt_001",
    speaker_id: "spk_004",
    speaker_name: "Fatima Zahra",
    room_name: "Main Hall",
  },
  {
    id: "sess_005",
    title: "Closing Panel: What's Next?",
    start: "2026-04-17T16:00:00",
    end: "2026-04-17T17:30:00",
    room_id: "room_001",
    event_id: "evt_001",
    speaker_id: "spk_001",
    speaker_name: "Ahmed Benali",
    room_name: "Main Hall",
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "tkt_001",
    user_id: "usr_010",
    event_id: "evt_001",
    type: "vip",
    price: 150,
    status: "active",
    user_name: "John Smith",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "tkt_002",
    user_id: "usr_011",
    event_id: "evt_001",
    type: "standard",
    price: 50,
    status: "active",
    user_name: "Emma Wilson",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "tkt_003",
    user_id: "usr_012",
    event_id: "evt_001",
    type: "early_bird",
    price: 35,
    status: "used",
    user_name: "Omar Hassan",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "tkt_004",
    user_id: "usr_013",
    event_id: "evt_002",
    type: "vip",
    price: 300,
    status: "active",
    user_name: "Lisa Chen",
    event_title: "AI Summit Paris",
  },
  {
    id: "tkt_005",
    user_id: "usr_014",
    event_id: "evt_003",
    type: "free",
    price: 0,
    status: "active",
    user_name: "Youssef Alami",
    event_title: "Startup Weekend Rabat",
  },
  {
    id: "tkt_006",
    user_id: "usr_015",
    event_id: "evt_001",
    type: "standard",
    price: 50,
    status: "cancelled",
    user_name: "Sophie Martin",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "tkt_007",
    user_id: "usr_016",
    event_id: "evt_004",
    type: "vip",
    price: 500,
    status: "active",
    user_name: "Alex Johnson",
    event_title: "Web3 Conference Dubai",
  },
  {
    id: "tkt_008",
    user_id: "usr_017",
    event_id: "evt_005",
    type: "standard",
    price: 75,
    status: "used",
    user_name: "Maria Garcia",
    event_title: "UX Design Week",
  },
];

export const mockSpeakers: Speaker[] = [
  {
    id: "spk_001",
    name: "Ahmed Benali",
    email: "ahmed@benali.dev",
    bio: "CTO at TechCorp, 15+ years in software engineering",
    topic: "Full-Stack Architecture",
    company: "TechCorp",
    events_count: 12,
    avatar: "",
  },
  {
    id: "spk_002",
    name: "Marie Dupont",
    email: "marie@dupont.io",
    bio: "Lead Developer Advocate at Vercel",
    topic: "Next.js & React",
    company: "Vercel",
    events_count: 8,
    avatar: "",
  },
  {
    id: "spk_003",
    name: "Carlos Rivera",
    email: "carlos@designsys.co",
    bio: "Design Systems Lead at Figma",
    topic: "AI-Powered Design",
    company: "Figma",
    events_count: 5,
    avatar: "",
  },
  {
    id: "spk_004",
    name: "Fatima Zahra",
    email: "fatima@cloud.io",
    bio: "Principal Cloud Architect at AWS",
    topic: "Cloud Infrastructure",
    company: "AWS",
    events_count: 20,
    avatar: "",
  },
  {
    id: "spk_005",
    name: "James Okonkwo",
    email: "james@dataml.com",
    bio: "Head of ML Engineering at DataML",
    topic: "Machine Learning",
    company: "DataML",
    events_count: 15,
    avatar: "",
  },
];

export const mockExposants: Exposant[] = [
  {
    id: "exp_001",
    name: "TechGear Pro",
    email: "booth@techgear.com",
    company: "TechGear Pro",
    stand_number: "A-12",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "exp_002",
    name: "CloudFirst Solutions",
    email: "expo@cloudfirst.io",
    company: "CloudFirst Solutions",
    stand_number: "B-05",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "exp_003",
    name: "DevTools Inc",
    email: "stand@devtools.dev",
    company: "DevTools Inc",
    stand_number: "C-01",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "exp_004",
    name: "AI Labs",
    email: "booth@ailabs.ai",
    company: "AI Labs",
    stand_number: "A-01",
    event_id: "evt_002",
    event_title: "AI Summit Paris",
  },
];

export const mockSponsors: Sponsor[] = [
  {
    id: "spon_001",
    name: "Google Cloud",
    company: "Google",
    tier: "platinum",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "spon_002",
    name: "Microsoft Azure",
    company: "Microsoft",
    tier: "gold",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "spon_003",
    name: "AWS",
    company: "Amazon",
    tier: "gold",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "spon_004",
    name: "Vercel",
    company: "Vercel",
    tier: "silver",
    event_id: "evt_001",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "spon_005",
    name: "OpenAI",
    company: "OpenAI",
    tier: "platinum",
    event_id: "evt_002",
    event_title: "AI Summit Paris",
  },
  {
    id: "spon_006",
    name: "Stripe",
    company: "Stripe",
    tier: "bronze",
    event_id: "evt_003",
    event_title: "Startup Weekend Rabat",
  },
];

export const mockRegistrations: Registration[] = [
  {
    id: "reg_001",
    user_id: "usr_010",
    event_id: "evt_001",
    status: "confirmed",
    registered_at: "2026-03-01T10:00:00",
    user_name: "John Smith",
    user_email: "john@smith.com",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "reg_002",
    user_id: "usr_011",
    event_id: "evt_001",
    status: "confirmed",
    registered_at: "2026-03-02T14:30:00",
    user_name: "Emma Wilson",
    user_email: "emma@wilson.co",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "reg_003",
    user_id: "usr_012",
    event_id: "evt_001",
    status: "pending",
    registered_at: "2026-03-05T09:15:00",
    user_name: "Omar Hassan",
    user_email: "omar@hassan.dev",
    event_title: "DevFest Morocco 2026",
  },
  {
    id: "reg_004",
    user_id: "usr_013",
    event_id: "evt_002",
    status: "confirmed",
    registered_at: "2026-03-08T16:00:00",
    user_name: "Lisa Chen",
    user_email: "lisa@chen.ai",
    event_title: "AI Summit Paris",
  },
  {
    id: "reg_005",
    user_id: "usr_014",
    event_id: "evt_003",
    status: "cancelled",
    registered_at: "2026-03-10T11:45:00",
    user_name: "Youssef Alami",
    user_email: "youssef@alami.ma",
    event_title: "Startup Weekend Rabat",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    user_id: "usr_001",
    title: "New Registration",
    body: "John Smith registered for DevFest Morocco 2026",
    read: false,
    type: "info",
    created_at: "2026-03-12T08:30:00",
  },
  {
    id: "notif_002",
    user_id: "usr_001",
    title: "Ticket Sold",
    body: "VIP ticket sold for AI Summit Paris — $300",
    read: false,
    type: "success",
    created_at: "2026-03-12T07:15:00",
  },
  {
    id: "notif_003",
    user_id: "usr_001",
    title: "Event Starting Soon",
    body: "Startup Weekend Rabat starts in 16 days",
    read: true,
    type: "warning",
    created_at: "2026-03-11T18:00:00",
  },
  {
    id: "notif_004",
    user_id: "usr_001",
    title: "Speaker Confirmed",
    body: "Fatima Zahra confirmed for Cloud Native Summit",
    read: true,
    type: "success",
    created_at: "2026-03-11T14:20:00",
  },
  {
    id: "notif_005",
    user_id: "usr_001",
    title: "Ticket Cancelled",
    body: "Sophie Martin cancelled her ticket for DevFest",
    read: false,
    type: "error",
    created_at: "2026-03-10T16:45:00",
  },
];

export const mockNetworking: NetworkingRequest[] = [
  {
    id: "net_001",
    sender_id: "usr_010",
    receiver_id: "usr_011",
    event_id: "evt_001",
    status: "pending",
    message: "Hi! Would love to connect about your talk on React patterns.",
    sender_name: "John Smith",
    receiver_name: "Emma Wilson",
    event_title: "DevFest Morocco 2026",
    created_at: "2026-03-12T09:00:00",
  },
  {
    id: "net_002",
    sender_id: "usr_012",
    receiver_id: "usr_013",
    event_id: "evt_001",
    status: "accepted",
    message: "Great session! Let's discuss collaboration opportunities.",
    sender_name: "Omar Hassan",
    receiver_name: "Lisa Chen",
    event_title: "DevFest Morocco 2026",
    created_at: "2026-03-11T15:30:00",
  },
  {
    id: "net_003",
    sender_id: "usr_014",
    receiver_id: "usr_010",
    event_id: "evt_003",
    status: "rejected",
    message: "Interested in your startup idea.",
    sender_name: "Youssef Alami",
    receiver_name: "John Smith",
    event_title: "Startup Weekend Rabat",
    created_at: "2026-03-10T12:00:00",
  },
];

// ── KPI Data ──
export const kpiData = {
  totalEvents: { value: 6, change: 20, trend: "up" as const },
  ticketsSold: { value: 3390, change: 12.5, trend: "up" as const },
  totalRevenue: { value: 358900, change: 8.3, trend: "up" as const },
  attendanceRate: { value: 78.5, change: -2.1, trend: "down" as const },
};

// ── Chart Data ──
export const monthlyEventData = [
  { month: "Jan", events: 2, tickets: 280, revenue: 14000 },
  { month: "Feb", events: 3, tickets: 500, revenue: 37500 },
  { month: "Mar", events: 4, tickets: 380, revenue: 22800 },
  { month: "Apr", events: 5, tickets: 1480, revenue: 89400 },
  { month: "May", events: 3, tickets: 320, revenue: 48000 },
  { month: "Jun", events: 4, tickets: 890, revenue: 178000 },
  { month: "Jul", events: 2, tickets: 150, revenue: 12000 },
  { month: "Aug", events: 1, tickets: 80, revenue: 4800 },
  { month: "Sep", events: 3, tickets: 420, revenue: 33600 },
  { month: "Oct", events: 5, tickets: 680, revenue: 54400 },
  { month: "Nov", events: 4, tickets: 560, revenue: 44800 },
  { month: "Dec", events: 2, tickets: 200, revenue: 16000 },
];

export const ticketTypeData = [
  { type: "VIP", count: 420, revenue: 126000, fill: "var(--chart-1)" },
  { type: "Standard", count: 1850, revenue: 92500, fill: "var(--chart-2)" },
  { type: "Early Bird", count: 680, revenue: 23800, fill: "var(--chart-3)" },
  { type: "Free", count: 440, revenue: 0, fill: "var(--chart-4)" },
];

export const sparklineData = {
  events: [2, 3, 4, 5, 3, 4, 2, 1, 3, 5, 4, 2],
  tickets: [280, 500, 380, 1480, 320, 890, 150, 80, 420, 680, 560, 200],
  revenue: [14, 37.5, 22.8, 89.4, 48, 178, 12, 4.8, 33.6, 54.4, 44.8, 16],
  attendance: [72, 78, 65, 82, 74, 80, 68, 71, 85, 79, 76, 78],
};
