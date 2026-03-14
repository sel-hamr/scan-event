<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
</p>

# 🎫 EventScan — Event Management & Check-In Platform

> A full-stack, role-aware event management platform built for organizers, sponsors, exhibitors, speakers, and attendees. EventScan streamlines the entire event lifecycle — from creation and ticketing to real-time QR check-in and in-event networking.

---

## Table of Contents

1. [Overview](#overview)
2. [Functional Specifications](#functional-specifications)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Data Model](#data-model)
6. [Design System](#design-system)
7. [Technical Implementation](#technical-implementation)
8. [Getting Started](#getting-started)
9. [Project Structure](#project-structure)
10. [Environment Variables](#environment-variables)
11. [License](#license)

---

## Overview

EventScan is a **multi-tenant, role-based SaaS dashboard** designed to operate the full lifecycle of events — from creation and promotion, through ticket sales and attendee registration, to real-time QR-based check-in at the door.

The platform serves **six distinct user roles**, each receiving a tailored navigation and feature set:

| Role            | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| **Super Admin** | Full platform control — dashboard KPIs, all events, all entities   |
| **Organiser**   | Manages own events, users, registrations                           |
| **Participant** | Browses public events, buys tickets, manages own tickets, networks |
| **Scanner**     | Dedicated QR scan & ticket validation interface                    |
| **Exposant**    | Exhibitor view (future expansion)                                  |
| **Speaker**     | Speaker profile & session management                               |

---

## Functional Specifications

### 1. Authentication & Authorization

| Feature                    | Details                                                      |
| -------------------------- | ------------------------------------------------------------ |
| **Credential-based login** | Email + bcrypt-hashed password via JWT (HS256, 7-day expiry) |
| **Registration**           | Self-service sign-up with automatic `PARTICIPANT` role       |
| **Session handling**       | Stateless JWT stored in an HTTP-only cookie (`auth_token`)   |
| **Role-based routing**     | Middleware enforces page-level access per role               |
| **Mobile / API auth**      | Stateless Bearer token via `/api/v2/*` endpoints             |

### 2. Dashboard (Super Admin)

| Feature                      | Details                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| **KPI cards**                | Total events, tickets sold, total revenue, attendance rate |
| **Revenue & Tickets chart**  | Dual-axis line chart (monthly breakdown)                   |
| **Ticket type distribution** | Donut chart with legend                                    |
| **Recent registrations**     | Real-time list with avatar monogram + status badge         |
| **Upcoming events**          | Calendar-style list with ticket fill progress              |

### 3. Event Management

| Feature                   | Details                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| **CRUD operations**       | Create, read, update events with rich metadata                         |
| **Event lifecycle**       | Status workflow: `DRAFT → PUBLISHED → ONGOING → COMPLETED / CANCELLED` |
| **Rooms & sessions**      | Rooms with capacity, sessions with speaker assignment                  |
| **Registration tracking** | Status tracking: `PENDING → CONFIRMED / CANCELLED`                     |
| **attendee capacity**     | Configurable `attendeesCount` and `ticketsSold` metrics                |

### 4. Ticketing

| Feature                     | Details                                                  |
| --------------------------- | -------------------------------------------------------- |
| **Ticket types**            | `VIP`, `STANDARD`, `FREE`, `EARLY_BIRD`                  |
| **Ticket statuses**         | `ACTIVE`, `USED`, `CANCELLED`, `EXPIRED`                 |
| **QR code generation**      | Server-side QR code generation via the `qrcode` library  |
| **QR code download**        | One-click PNG download from ticket detail page           |
| **Purchase flow**           | Participants buy tickets through the event detail page   |
| **Participant ticket view** | Dedicated `/tickets/mine` section with stub-style design |

### 5. QR Scanner

| Feature                     | Details                                                      |
| --------------------------- | ------------------------------------------------------------ |
| **Camera-based scanning**   | Native `BarcodeDetector` API integration                     |
| **Manual code input**       | Fallback text input for codes                                |
| **Event-scoped validation** | Tickets validated against a selected event                   |
| **Scan result feedback**    | Success/failure card with attendee info and timestamp        |
| **Duplicate detection**     | Already-scanned tickets return `409` with original scan time |

### 6. Speakers, Exhibitors & Sponsors

| Feature                   | Details                                                    |
| ------------------------- | ---------------------------------------------------------- |
| **Speaker profiles**      | Name, bio, topic, company, avatar, linked sessions         |
| **Exhibitors**            | Company name, stand number, event association              |
| **Sponsors**              | Tiered sponsorship: `PLATINUM`, `GOLD`, `SILVER`, `BRONZE` |
| **CRUD for all entities** | Create, list, detail view with premium card designs        |

### 7. Companies

| Feature               | Details                                                     |
| --------------------- | ----------------------------------------------------------- |
| **Company directory** | Searchable list with monogram avatars                       |
| **Company detail**    | Description, contact info, related events, associated users |
| **KPI strip**         | Company-level metrics on the listing page                   |

### 8. Networking

| Feature              | Details                                              |
| -------------------- | ---------------------------------------------------- |
| **Friend requests**  | Send/receive connection requests per event           |
| **Request statuses** | `PENDING`, `ACCEPTED`, `REJECTED`                    |
| **User discovery**   | Search and browse attendees within events            |
| **User profiles**    | Detailed profile view with company and event history |

### 9. Notifications

| Feature                | Details                                                 |
| ---------------------- | ------------------------------------------------------- |
| **Real-time badge**    | Unread count in sidebar/header via Zustand store        |
| **Notification types** | `INFO`, `SUCCESS`, `WARNING`, `ERROR` with color coding |
| **Mark as read**       | Individual or bulk read state management                |

### 10. Settings

| Feature                   | Details                                          |
| ------------------------- | ------------------------------------------------ |
| **Profile editing**       | Name, phone, avatar, password change             |
| **Appearance**            | Dark mode toggle with `localStorage` persistence |
| **Auto-collapse sidebar** | Responsive sidebar preference                    |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Login   │  │Dashboard │  │  Scanner  │  │  Participant  │  │
│  │  Page    │  │  (Admin) │  │   Page    │  │    Views      │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬────────┘  │
│       │              │              │               │            │
│       └──────────────┼──────────────┼───────────────┘            │
│                      ▼                                           │
│            ┌──────────────────┐                                  │
│            │  App Router      │  Next.js 16 (App Router)        │
│            │  + Middleware     │  Role-based route protection    │
│            └────────┬─────────┘                                  │
└─────────────────────┼───────────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────────┐
│                  SERVER TIER                                     │
│                      ▼                                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  API Layer                                 │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │  │
│  │  │ /api/*   │  │/api/v2/* │  │ Server  │  │  Server   │  │  │
│  │  │ Internal │  │ Mobile   │  │ Actions │  │Components │  │  │
│  │  │ Routes   │  │  API     │  │         │  │           │  │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬────┘  └─────┬─────┘  │  │
│  │       │              │             │              │        │  │
│  │       └──────────────┼─────────────┘              │        │  │
│  │                      ▼                            │        │  │
│  │           ┌──────────────────┐                    │        │  │
│  │           │   JWT Auth       │◄───────────────────┘        │  │
│  │           │  (jose + cookie) │                             │  │
│  │           └────────┬─────────┘                             │  │
│  │                    ▼                                       │  │
│  │           ┌──────────────────┐                             │  │
│  │           │  Prisma ORM      │                             │  │
│  │           │  (Data Access)   │                             │  │
│  │           └────────┬─────────┘                             │  │
│  └────────────────────┼──────────────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│                  DATA TIER                                       │
│                       ▼                                          │
│            ┌──────────────────┐                                  │
│            │   PostgreSQL     │                                  │
│            │   Database       │                                  │
│            └──────────────────┘                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Architectural Decisions

| Decision                 | Rationale                                                                    |
| ------------------------ | ---------------------------------------------------------------------------- |
| **Next.js App Router**   | File-system routing, React Server Components, streaming, built-in API routes |
| **Route Groups**         | `(dashboard)` group for layout isolation — sidebar + header injected once    |
| **JWT over sessions**    | Stateless, works across web (cookie) and mobile (Bearer header)              |
| **Server Actions**       | Collocated mutations (e.g., `user-actions.ts`) for form-heavy CRUD           |
| **Client-side fetching** | Dashboard KPIs and lists use `useEffect + fetch` for real-time data          |
| **Zustand stores**       | Lightweight, zero-boilerplate global state (sidebar, notifications)          |

---

## Technology Stack

### Core Framework

| Layer      | Technology       | Version | Purpose                                      |
| ---------- | ---------------- | ------- | -------------------------------------------- |
| Runtime    | **Next.js**      | 16.1.6  | Full-stack React framework (App Router)      |
| Language   | **TypeScript**   | 5.x     | Type-safe development                        |
| UI Library | **React**        | 19.2.3  | Component rendering with concurrent features |
| Styling    | **Tailwind CSS** | 4.x     | Utility-first CSS with custom design tokens  |

### Database & ORM

| Technology     | Version | Purpose                                |
| -------------- | ------- | -------------------------------------- |
| **PostgreSQL** | —       | Primary relational database            |
| **Prisma**     | 6.19.x  | Type-safe ORM, schema-first migrations |

### Authentication & Security

| Technology            | Purpose                               |
| --------------------- | ------------------------------------- |
| **jose**              | JWT signing/verification (HS256)      |
| **bcryptjs**          | Password hashing (salt rounds)        |
| **next-auth**         | Legacy provider (credentials adapter) |
| **HTTP-only cookies** | Secure session token storage          |

### UI Component Library

| Technology           | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| **shadcn/ui**        | Pre-built accessible primitives (Dialog, Select, Tabs, etc.) |
| **@base-ui/react**   | Low-level unstyled components (Dropdown, Menu)               |
| **Lucide React**     | Consistent, tree-shakeable icon set                          |
| **Recharts**         | Data visualization (Line, Bar, Pie charts)                   |
| **react-day-picker** | Date picker component                                        |
| **Sonner**           | Toast notification system                                    |

### Forms & Validation

| Technology              | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| **React Hook Form**     | Performant, uncontrolled form management |
| **Zod**                 | Schema-driven runtime validation         |
| **@hookform/resolvers** | Zod ↔ React Hook Form bridge             |

### State Management

| Technology      | Purpose                                                      |
| --------------- | ------------------------------------------------------------ |
| **Zustand**     | Minimal global stores (sidebar collapse, notification count) |
| **React state** | Component-local state for page-level data                    |

### Utilities

| Technology                   | Purpose                              |
| ---------------------------- | ------------------------------------ |
| **date-fns**                 | Lightweight date formatting          |
| **qrcode**                   | Server-side QR code image generation |
| **clsx + tailwind-merge**    | Conditional class name merging       |
| **class-variance-authority** | Variant-driven component styling     |

---

## Data Model

The application uses **12 core models** organized around the event domain:

```
┌─────────┐       ┌─────────┐       ┌──────────┐
│  User   │──────▶│  Event  │◀──────│ Company  │
└────┬────┘       └────┬────┘       └──────────┘
     │                 │
     │    ┌────────────┼────────────┬─────────────┐
     │    │            │            │             │
     ▼    ▼            ▼            ▼             ▼
┌────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐
│ Ticket │  │  Session │  │Exposant │  │ Sponsor  │
└───┬────┘  └────┬─────┘  └─────────┘  └──────────┘
    │            │
    ▼            ▼
┌────────┐  ┌─────────┐
│QrCode  │  │ Speaker │
└────────┘  └─────────┘

Other models: Registration, Notification, NetworkingRequest, Room
```

### Key Enums

| Enum                      | Values                                                                         |
| ------------------------- | ------------------------------------------------------------------------------ |
| `UserRole`                | `PARTICIPANT`, `ORGANISATEUR`, `SCANNER`, `EXPOSANT`, `SPEAKER`, `SUPER_ADMIN` |
| `EventStatus`             | `DRAFT`, `PUBLISHED`, `ONGOING`, `COMPLETED`, `CANCELLED`                      |
| `TicketType`              | `VIP`, `STANDARD`, `FREE`, `EARLY_BIRD`                                        |
| `TicketStatus`            | `ACTIVE`, `USED`, `CANCELLED`, `EXPIRED`                                       |
| `SponsorTier`             | `PLATINUM`, `GOLD`, `SILVER`, `BRONZE`                                         |
| `RegistrationStatus`      | `CONFIRMED`, `PENDING`, `CANCELLED`                                            |
| `NetworkingRequestStatus` | `PENDING`, `ACCEPTED`, `REJECTED`                                              |

---

## Design System

### Visual Identity

| Token          | Value                              | Purpose                                    |
| -------------- | ---------------------------------- | ------------------------------------------ |
| **Primary**    | `#059467` (Emerald)                | Brand color, active states, CTA buttons    |
| **Font**       | Instrument Sans (Google Fonts)     | Modern, geometric sans-serif               |
| **Radius**     | `0.75rem` base with computed scale | Consistent rounded corners                 |
| **Dark mode**  | Default and priority               | Deep blacks (`#050709`) with high contrast |
| **Light mode** | Supported                          | Soft gray background (`#f4f5f8`)           |

### Design Principles

1. **Glassmorphism** — Cards use `backdrop-blur` + semi-transparent backgrounds for depth
2. **Micro-animations** — `animate-in`, `fade-in`, `transition-all duration-300` on interactive elements
3. **Consistent spacing** — Tailwind 4 spacing scale throughout
4. **Accessible contrast** — WCAG-aware foreground/background pairs in both modes
5. **Responsive layout** — Sidebar auto-collapses at `768px` breakpoint

### Component Architecture

```
components/
├── ui/                 # Design system primitives (shadcn/ui)
│   ├── button.tsx      # CVA-based variant system
│   ├── card.tsx        # Glass-style card with header/content/footer
│   ├── dialog.tsx      # Modal overlay
│   ├── dropdown-menu.tsx
│   ├── select.tsx      # Custom select with popover
│   ├── stat-card.tsx   # KPI card with sparkline
│   ├── table.tsx       # Data table primitives
│   └── ... (24 primitives)
├── layout/
│   ├── sidebar.tsx     # Role-aware collapsible sidebar
│   ├── header.tsx      # Top bar with search, notifications, user menu
│   └── public-navbar.tsx # Public pages (login/register)
├── auth/               # Auth-related components
├── events/             # Event-specific composed components
├── networking/         # Networking cards and actions
└── tickets/            # Ticket display components
```

---

## Technical Implementation

### Authentication Flow

```
┌────────┐    POST /api/login     ┌────────────┐
│ Client │──────────────────────▶│ Login API  │
│  Form  │                       │            │
└────────┘                       └──────┬─────┘
                                        │
                            1. Lookup user by email
                            2. Verify bcrypt hash
                            3. Sign JWT (jose, HS256, 7d)
                            4. Set HTTP-only cookie
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │  Redirect to  │
                                 │  /  or /events│
                                 └──────────────┘
```

### Middleware Pipeline

The Edge middleware (`middleware.ts`) runs on **every non-API, non-static request** and enforces:

1. **Unauthenticated users** → Redirected to `/login`
2. **Authenticated on `/login`** → Redirected to `/` (admin) or `/events` (others)
3. **Participants on `/tickets`** → Redirected to `/tickets/mine`
4. **Participants on restricted paths** → Redirected to `/events`

Restricted paths for `PARTICIPANT` role:

```
/  /tickets  /scanner  /speakers  /exposants  /sponsors  /companies  /events/create
```

### API (v2)

The `/api/v2/*` endpoints provide a **stateless, JSON-only** interface for external clients:

| Endpoint              | Method      | Auth             | Description                                         |
| --------------------- | ----------- | ---------------- | --------------------------------------------------- |
| `/api/v2/login`       | POST        | —                | Authenticate and receive JWT                        |
| `/api/v2/register`    | POST        | —                | Create account                                      |
| `/api/v2/me`          | GET / PATCH | Bearer           | Profile info (with `?ticket=true` or `?event=true`) |
| `/api/v2/events`      | GET         | Bearer           | Paginated, filterable event list                    |
| `/api/v2/tickets`     | GET         | Bearer           | User's tickets with filters                         |
| `/api/v2/scan-ticket` | POST        | Bearer (SCANNER) | Validate a ticket QR code                           |

> See [`API_README.md`](./API_README.md) for full request/response examples.

### QR Code Scanning Pipeline

```
Camera → BarcodeDetector API → Detect QR Value
                                      │
                          ┌───────────┘
                          ▼
              POST /api/scanner { code, eventId }
                          │
              ┌───────────┼──────────────┐
              ▼           ▼              ▼
         Not Found    Already Scanned   Valid
         (404)        (409 + timestamp)  (200 + mark USED)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** instance (local or hosted)
- **npm** (bundled with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/event-scan.git
cd event-scan

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your database URL and secrets

# 4. Set up the database
npx prisma generate
npx prisma db push

# 5. (Optional) Seed with sample data
npx tsx prisma/seed.ts

# 6. (Optional) Create a Super Admin
npx tsx prisma/seed-admin.ts

# 7. Start the development server
npm run dev
```

The app will be available at **`http://localhost:3000`**.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
event-scan/
├── app/
│   ├── (dashboard)/           # Authenticated layout group
│   │   ├── layout.tsx         # Sidebar + header shell
│   │   ├── page.tsx           # Admin dashboard
│   │   ├── events/            # Event CRUD pages
│   │   ├── tickets/           # Ticket management (admin + participant)
│   │   ├── scanner/           # QR scanner page
│   │   ├── speakers/          # Speaker CRUD
│   │   ├── exposants/         # Exhibitor CRUD
│   │   ├── sponsors/          # Sponsor CRUD
│   │   ├── companies/         # Company directory
│   │   ├── networking/        # Networking & user discovery
│   │   ├── notifications/     # Notification center
│   │   └── settings/          # User settings
│   ├── login/                 # Public login page
│   ├── register/              # Public registration page
│   ├── actions/               # Server actions (mutations)
│   ├── api/                   # API route handlers
│   │   ├── v2/                # Mobile/external API
│   │   └── ...                # Internal API routes
│   ├── globals.css            # Design tokens + theme
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # 24 design system primitives
│   ├── layout/                # Sidebar, header, public navbar
│   ├── auth/                  # Auth components
│   ├── events/                # Event-specific components
│   ├── networking/            # Networking components
│   └── tickets/               # Ticket components
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   ├── jwt-auth.ts            # JWT sign/verify helpers
│   ├── utils.ts               # cn(), formatCurrency(), etc.
│   └── mock-data.ts           # Development seed data
├── stores/
│   └── index.ts               # Zustand stores (sidebar, notifications)
├── hooks/
│   └── use-mobile.ts          # Responsive breakpoint hook
├── prisma/
│   ├── schema.prisma          # Database schema (12 models)
│   ├── seed.ts                # Sample data seeder
│   └── seed-admin.ts          # Admin user seeder
├── middleware.ts               # Edge middleware (auth + routing)
├── auth.ts                     # NextAuth configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.*           # Tailwind v4 via PostCSS
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## Environment Variables

| Variable          | Required  | Description                  |
| ----------------- | --------- | ---------------------------- |
| `DATABASE_URL`    | ✅        | PostgreSQL connection string |
| `AUTH_JWT_SECRET` | ✅ (prod) | Secret key for JWT signing   |
| `NEXTAUTH_SECRET` | ✅        | NextAuth fallback secret     |
| `NEXTAUTH_URL`    | ✅        | Application base URL         |

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  <sub>Built with ❤️ by the EventScan team</sub>
</p>
